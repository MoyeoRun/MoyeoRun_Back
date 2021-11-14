import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class JobsService {
  constructor(@InjectQueue('multiRun') private multiRunQueue: Queue) {}

  async addJobMultiRunBroadCast(body) {
    console.log('multiRun 생성');
    const job = await this.multiRunQueue.add(
      'multiRunCreate',
      { body },
      {
        removeOnComplete: true,
        delay: body.delay,
      },
    );
    return job ? true : false;
  }
}
