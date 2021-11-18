import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { GlobalCacheService } from 'src/cache/global.cache.service';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { SocketGateway } from 'src/socket/socket.gateway';
import { MultiRoomRepository } from './../repository/multi-room.repository';

@Processor('multiRun')
export class JobsConsumer {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly multiRoomRepository: MultiRoomRepository,
    private readonly multiRoomMemberRepository: MultiRoomMemberRepository,
    private readonly roomStatusRepository: RoomStatusRepository,
    private readonly globalCacheService: GlobalCacheService,
  ) {}

  @Process('multiRunningStart')
  async multiRunningStart(job: Job) {
    const findRoom = await this.multiRoomRepository.findById(
      parseInt(job.data.roomId),
    );
    if (findRoom.status != 'Open') {
      return false;
    } else {
      const readyUser = await this.multiRoomMemberRepository.findReadyUser(
        parseInt(job.data.roomId),
      );
      if (readyUser.length > 0) {
        // 레디 유저가 있는 경우 시작
        await this.multiRoomRepository.updateRunning(parseInt(job.data.roomId));
        await this.multiRoomMemberRepository.deleteNotReadyUser(
          parseInt(job.data.roomId),
        );
        this.socketGateway.server.in(job.data.roomId.toString()).emit('start', {
          message: '러닝시작.',
          roomId: job.data.roomId,
        });

        this.globalCacheService.setCache(
          `running:${job.data.roomId}`,
          readyUser.length.toString(),
          { ttl: findRoom.targetTime / 1000 + 600 },
        );
        console.log(job.id);
      } else {
        // 레디 유저가 없는 경우 삭제
        console.log('러닝 시작 안함');
        await this.multiRoomRepository.delete(parseInt(job.data.roomId));
        await this.roomStatusRepository.deleteByRoomId(
          parseInt(job.data.roomId),
        );
      }
    }
  }

  @Process('multiRunningFinish')
  async multiRunningFinish(job: Job) {
    this.socketGateway.server
      .in(job.data.roomId)
      .emit('finish', '목표 시간이 지났습니다.');
    await this.globalCacheService.deleteCache(`running:${job.data.roomId}`);
    await this.roomStatusRepository.deleteByRoomId(parseInt(job.data.roomId));
    await this.multiRoomRepository.updateClose(parseInt(job.data.roomId));
  }
}
