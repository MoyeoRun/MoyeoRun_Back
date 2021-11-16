import { User } from '.prisma/client';
import { HttpException, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GlobalCacheService } from 'src/cache/global.cache.service';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { MultiRoomRepository } from 'src/repository/multi-room.repository';
import { RoomStatusRepository } from 'src/repository/room-status.repository';

@WebSocketGateway({ cors: true, transports: ['websocket'] })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly roomStatusRepository: RoomStatusRepository,
    private readonly multiRoomRepository: MultiRoomRepository,
    private readonly multiRoomMemberRepository: MultiRoomMemberRepository,
    private readonly globalCacheService: GlobalCacheService,
  ) {}
  @WebSocketServer() public server: Server;
  public socketId: string;
  private logger = new Logger('running');
  public roomStatus: any = {};
  afterInit() {
    this.logger.log('SOCKET!! running init');
  }

  @SubscribeMessage('ready')
  async handleReady(
    @MessageBody() data: { roomId: number; user: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      //방이 없는 경우 생성
      if (!this.roomStatus[`${data.roomId}`]) {
        const findRoom = await this.multiRoomRepository.findById(data.roomId);
        console.log(findRoom);
        this.roomStatus[`${data.roomId}`] = {};
        this.roomStatus[`${data.roomId}`]['connectedUserId'] = [];
        this.roomStatus[`${data.roomId}`]['multiRoomMember'] =
          findRoom.multiRoomMember.length;
        this.roomStatus[`${data.roomId}`]['targetTime'] = findRoom.targetTime;
      }

      //이미 신청한 경우 false;
      if (
        this.roomStatus[`${data.roomId}`]['connectedUserId'].includes(
          data.user.id,
        )
      ) {
        return false;
      }

      const multiMember = await this.multiRoomMemberRepository.updateReady(
        data.roomId,
        data.user.id,
      );
      this.roomStatus[`${data.roomId}`]['connectedUserId'].push(
        multiMember.userId,
      );

      this.server.in(data.roomId.toString()).emit('roomStatus', {
        connectedUserId: this.roomStatus[`${data.roomId}`]['connectedUserId'],
      });
      console.log(this.roomStatus[`${data.roomId}`]);

      //모두 다 참여한 경우
      if (
        this.roomStatus[`${data.roomId}`][`multiRoomMember`] ==
        this.roomStatus[`${data.roomId}`]['connectedUserId'].length
      ) {
        await this.multiRoomRepository.updateClose(data.roomId);
        this.server.in(data.roomId.toString()).emit('start', {
          message: '러닝시작.',
          roomId: data.roomId,
        });

        this.globalCacheService.createCache(
          `running-${data.roomId}`,
          this.roomStatus[`${data.roomId}`][
            'connectedUserId'
          ].length.toString(),
          { ttl: this.roomStatus[`${data.roomId}`]['targetTime'] / 1000 + 600 },
        );
      }
    } catch (err) {
      console.error(err);
      socket.emit('readyError', err);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    //연결 수립
    try {
      const participatedRoom = await this.roomStatusRepository.findByUserId(
        parseInt(data.userId),
      );
      if (participatedRoom.length > 0) {
        console.log('룸 존재');
        await this.roomStatusRepository.updateSocketIdByUserId(
          parseInt(data.userId),
          socket.id,
        );
        socket.join(participatedRoom[0].roomId.toString());
        //룸 정보 전송
      }
      const participatedRoomId = participatedRoom[0]
        ? participatedRoom[0].roomId
        : null;

      socket.emit('welcome', {
        roomId: participatedRoomId,
      });
      this.logger.log('연결성공');
    } catch (err) {
      console.log(err);
      throw new HttpException('연결실패', 500);
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('Socket 연결 성공');
    this.socketId = socket.id;
    return 'hello';
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('소켓 연결 종료');
    const participatedRoom = await this.roomStatusRepository.findBySocketId(
      socket.id,
    );
    if (participatedRoom.length > 0) {
      await this.roomStatusRepository.updateSocketIdByUserId(
        participatedRoom[0].userId,
        null,
      );
    }
  }
}
