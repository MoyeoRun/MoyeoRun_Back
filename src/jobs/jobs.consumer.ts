import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('multiRun')
export class JobsConsumer {
  @Process('multiRunCreate')
  async handleJob(job: Job) {
    console.log('멀티런 브로드캐스트');
    console.log(job.data);
    console.log(job.id);
  }
}
