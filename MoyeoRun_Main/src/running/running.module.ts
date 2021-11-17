import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalCacheModule } from 'src/cache/global.cache.module';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { SocketModule } from 'src/socket/socket.module';
import { MultiRoomRepository } from '../repository/multi-room.repository';
import { JobsModule } from './../jobs/jobs.module';
import { PrismaModule } from './../prisma/prisma.module';
import { MultiRoomController } from './controllers/multi-room.controller';
import { RunningController } from './controllers/running.controller';
import { RunDataRepository } from './repositories/run-data.repository';
import { RunningRepository } from './repositories/running.repository';
import { RunData, RunDataSchema } from './schemas/run-data.schema';
import { Runnings, RunningSchema } from './schemas/runnings.schema';
import { MultiRoomService } from './services/multi-room.service';
import { MultiRunningService } from './services/multi-running.service';
import { RunningService } from './services/running.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Runnings.name, schema: RunningSchema },
      { name: RunData.name, schema: RunDataSchema },
    ]),
    JobsModule,
    PrismaModule,
    SocketModule,
    GlobalCacheModule,
  ],
  controllers: [RunningController, MultiRoomController],
  providers: [
    MultiRunningService,
    RunningService,
    RunningRepository,
    RunDataRepository,
    MultiRoomService,
    MultiRoomRepository,
    RoomStatusRepository,
    MultiRoomMemberRepository,
  ],
})
export class RunningModule {}
