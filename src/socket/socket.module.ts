import { Module } from '@nestjs/common';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { PrismaModule } from './../prisma/prisma.module';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [PrismaModule],
  providers: [RoomStatusRepository, SocketGateway],
  exports: [SocketGateway, RoomStatusRepository],
})
export class SocketModule {}
