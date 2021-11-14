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

@WebSocketGateway({ cors: true })
export class RunningGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly roomStatusRepository: RoomStatusRepository) {}
  @WebSocketServer() public server: Server;
  public socketId: string;
  private logger = new Logger('running');

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
      console.log(data);
      const participatedRoom = await this.roomStatusRepository.findByUserId(
        parseInt(data.userId),
      );
      console.log(participatedRoom);
      if (participatedRoom.length > 0) {
        console.log('Hi');
        await this.roomStatusRepository.updateSocketIdByUserId(
          parseInt(data.userId),
          socket.id,
        );
        console.log(participatedRoom[0].roomId.toString());
        socket.join(participatedRoom[0].roomId.toString());
        // socket
        //   .to(participatedRoom[0].roomId.toString())
        //   .emit('broadcast', 'hid');
        socket.emit('message', { message: 'hi' });
      }
      this.logger.log('연결성공');
    } catch (err) {
      throw new HttpException('연결실패', 500);
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log('Socket Connected');
    console.log(socket.id);
    this.socketId = socket.id;
    return 'hello';
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('Socket Disconnedted');
    console.log(socket.id);
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
