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
import { RoomStatusRepository } from 'src/repository/room-status.repository';

@WebSocketGateway({ cors: true, transports: ['websocket'] })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly roomStatusRepository: RoomStatusRepository) {}
  @WebSocketServer() public server: Server;
  public socketId: string;
  private logger = new Logger('running');
  public roomStatus: any;
  afterInit() {
    this.logger.log('SOCKET!! running init');
  }

  @SubscribeMessage('send')
  test(
    @MessageBody() data: { message: string; id: string },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('send', `룸연결${data.id}`);
    console.log(data.id);
    this.server.in(data.id).emit('message', { message: data.message });
    // socket.in(data.id).emit('message', { message: data.message });
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
