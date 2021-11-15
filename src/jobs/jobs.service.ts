import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { subTimeByMillisecond } from 'src/common/utils/day.util';

@Injectable()
export class JobsService {
  constructor(@InjectQueue('multiRun') private multiRunQueue: Queue) {}

  async addJobMultiRunBroadCast(roomId: number, startTime: Date) {
    console.log('multiRun 생성');
    const delayTime = subTimeByMillisecond(new Date(startTime)) + 300000;
    console.log(delayTime);
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
}
