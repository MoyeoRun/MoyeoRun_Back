import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RunningController } from './controllers/running.controller';
import { RunDataRepository } from './repositories/run-data.repository';
import { RunningRepository } from './repositories/running.repository';
import { RunData, RunDataSchema } from './schemas/run-data.schema';
import { Runnings, RunningSchema } from './schemas/runnings.schema';
import { SingleRunningService } from './services/single-running.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Runnings.name, schema: RunningSchema },
      { name: RunData.name, schema: RunDataSchema },
    ]),
  ],
  controllers: [RunningController],
  providers: [SingleRunningService, RunningRepository, RunDataRepository],
})
export class RunningModule {}
