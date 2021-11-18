import { forwardRef, Module } from '@nestjs/common';
import { JobsModule } from 'src/jobs/jobs.module';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { GlobalCacheModule } from './../cache/global.cache.module';
import { PrismaModule } from './../prisma/prisma.module';
import { MultiRoomRepository } from './../repository/multi-room.repository';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [PrismaModule, GlobalCacheModule, forwardRef(() => JobsModule)],
  providers: [
    RoomStatusRepository,
    SocketGateway,
    MultiRoomRepository,
    MultiRoomMemberRepository,
  ],
  exports: [SocketGateway],
})
export class SocketModule {}
