import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RunningController } from './controllers/running.controller';
import { RunningRespository } from './running.repository';
import { Runnings, RunningSchema } from './schemas/running.schema';
import { SingleRunningService } from './services/single-running.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Runnings.name, schema: RunningSchema }]),
  ],
  controllers: [RunningController],
  providers: [SingleRunningService, RunningRespository],
})
export class RunningModule {}
