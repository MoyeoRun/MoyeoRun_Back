import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { redisConstants } from './../config/redis.config';
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
  ],
  providers: [JobsConsumer, JobsService],
  exports: [JobsService],
})
export class JobsModule {}
