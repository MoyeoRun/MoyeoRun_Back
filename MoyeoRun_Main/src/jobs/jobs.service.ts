import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { subTimeByMillisecond } from 'src/common/utils/day.util';

@Injectable()
export class JobsService {
  constructor(@InjectQueue('multiRun') private multiRunQueue: Queue) {}

  async addJobMultiRunBroadCastStart(roomId: number, startTime: Date) {
    console.log('multiRun 생성');
    const delayTime = subTimeByMillisecond(new Date(startTime)) + 30000;
    const job = await this.multiRunQueue.add(
      'multiRunningStart',
      { roomId },
      {
        removeOnComplete: true,
        delay: delayTime,
      },
    );
    return job;
  }

  async finishMultiRunBroadCast(roomId: number, targetTime: number) {
    return await this.multiRunQueue.add(
      'multiRunningFinish',
      { roomId },
      {
        removeOnComplete: true,
        delay: targetTime,
      },
    );
  }

  async prepareMultiRunBroadCast(roomId: number, startTime: Date) {
    const delayTime = subTimeByMillisecond(new Date(startTime)) - 30000;
    const job = await this.multiRunQueue.add(
      'multiRunningPrepare',
      { roomId },
      {
        removeOnComplete: true,
        delay: delayTime,
      },
    );
    return job;
  }
}
