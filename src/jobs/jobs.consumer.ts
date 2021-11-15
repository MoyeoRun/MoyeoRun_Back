import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SocketGateway } from 'src/socket/socket.gateway';
import { MultiRoomRepository } from './../repository/multi-room.repository';

@Processor('multiRun')
export class JobsConsumer {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly multiRoomRepository: MultiRoomRepository,
  ) {}

  @Process('multiRunningStart')
  async handleJob(job: Job) {
    const findRoom = await this.multiRoomRepository.findById(
      parseInt(job.data.roomId),
    );
    if (findRoom.status == 'Close') {
      return false;
    } else {
      this.socketGateway.server.in(job.data.roomId.toString()).emit('start', {
        message: '러닝시작.',
        roomId: job.data.roomId,
      });
      console.log(job.id);
    }
  }
}
