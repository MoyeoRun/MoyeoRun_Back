import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from 'src/socket/socket.gateway';
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
    SocketModule,
    PrismaModule,
  ],
  providers: [JobsConsumer, JobsService, SocketGateway, MultiRoomRepository],
  exports: [JobsService],
})
export class JobsModule {}
