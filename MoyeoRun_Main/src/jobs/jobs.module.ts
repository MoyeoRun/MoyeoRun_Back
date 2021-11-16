import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { GlobalCacheModule } from 'src/cache/global.cache.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { SocketModule } from 'src/socket/socket.module';
import { redisConstants } from './../config/redis.config';
import { MultiRoomRepository } from './../repository/multi-room.repository';
import { JobsConsumer } from './jobs.consumer';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: redisConstants.url,
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'multiRun',
    }),
    forwardRef(() => SocketModule),
    PrismaModule,
    GlobalCacheModule,
  ],
  providers: [
    JobsConsumer,
    JobsService,
    MultiRoomRepository,
    MultiRoomMemberRepository,
    RoomStatusRepository,
  ],
  exports: [JobsService],
})
export class JobsModule {}
