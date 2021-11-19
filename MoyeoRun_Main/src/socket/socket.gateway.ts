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
import { JobsService } from 'src/jobs/jobs.service';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { MultiRoomRepository } from 'src/repository/multi-room.repository';
import { MultiRoomWithMember } from 'src/repository/prisma.type';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { RunDataType } from 'src/running/running.type';

@WebSocketGateway({ cors: true, transports: ['websocket'] })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly roomStatusRepository: RoomStatusRepository,
    private readonly multiRoomRepository: MultiRoomRepository,
    private readonly multiRoomMemberRepository: MultiRoomMemberRepository,
    private readonly globalCacheService: GlobalCacheService,
    private readonly jobsService: JobsService,
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
      //이미 신청한 경우 false
      const alreadyUser =
        await this.multiRoomMemberRepository.findReadyUserByUserId(
          data.user.id,
        );
      if (alreadyUser[0]) return false;

      //멤버 레디로 바꾸고
      await this.multiRoomMemberRepository.updateReady(
        data.roomId,
        data.user.id,
      );

      //룸정보찾고
      const findRoom = await this.multiRoomRepository.findById(data.roomId);

      //룸에서 레디 유저만 가져와서
      const readyUsers = findRoom.multiRoomMember.filter((data) => {
        data.isReady == true;
      });

      //레디 유저 전송
      this.server.in(data.roomId.toString()).emit('roomStatus', {
        connectedUserId: readyUsers,
      });

      //모두 다 참여한 경우
      if (findRoom.multiRoomMember.length == readyUsers.length) {
        await this.multiRoomRepository.updateRunning(data.roomId);
        this.server.in(data.roomId.toString()).emit('start', {
          message: '러닝시작.',
          roomId: data.roomId,
        });

        this.globalCacheService.setCache(
          `running:${data.roomId}`,
          readyUsers.length.toString(),
          { ttl: findRoom.targetTime / 1000 + 60 },
        );

        const finishMultiRunBroadCast =
          await this.jobsService.finishMultiRunBroadCast(
            data.roomId,
            findRoom.targetTime,
          );

        this.globalCacheService.setCache(
          `runningFinishJob:${data.roomId}`,
          String(finishMultiRunBroadCast.id),
          { ttl: findRoom.targetTime / 1000 },
        );
      }
    } catch (err) {
      console.error(err);
      socket.emit('readyError', err);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    //연결 수립
    try {
      const participatedRoom = await this.roomStatusRepository.findByUserId(
        data.userId,
      );
      let findRoom: MultiRoomWithMember | null;
      let findRoomMember;
      if (participatedRoom.length > 0) {
        console.log('룸 존재');
        await this.roomStatusRepository.updateSocketIdByUserId(
          data.userId,
          socket.id,
        );
        socket.join(participatedRoom[0].roomId.toString());
        findRoom = await this.multiRoomRepository.findById(
          participatedRoom[0].roomId,
        );
        findRoomMember = findRoom.multiRoomMember.filter(
          (member) => member.userId == data.userId,
        );
        //룸 정보 전송
      }
      const participatedRoomId = participatedRoom[0]
        ? participatedRoom[0].roomId
        : null;
      socket.emit('welcome', {
        roomId: participatedRoomId,
        status: findRoom ? findRoom.status : null,
        isReady: findRoomMember ? findRoomMember[0].isReady : null,
      });
      this.logger.log('연결성공');
    } catch (err) {
      console.log(err);
      throw new HttpException('연결실패', 500);
    }
  }

  @SubscribeMessage('runData')
  async handleRunData(
    @MessageBody()
    data: { userId: number; runData: RunDataType[]; roomId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    socket
      .in(String(data.roomId))
      .emit('runBroadCast', { runData: data.runData, userId: data.userId });
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
