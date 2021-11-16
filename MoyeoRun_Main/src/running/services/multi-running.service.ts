import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { GlobalCacheService } from 'src/cache/global.cache.service';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { MultiRoomRepository } from 'src/repository/multi-room.repository';
import { SocketGateway } from 'src/socket/socket.gateway';
import { MultiRunningRequest, RunningResponse } from '../dto/running.dto';
import { RunDataRepository } from '../repositories/run-data.repository';
import { RunningRepository } from '../repositories/running.repository';
import { RunningService } from './running.service';
@Injectable()
export class SingleRunningService {
  constructor(
    private readonly runningRepository: RunningRepository,
    private readonly runDataRepository: RunDataRepository,
    private readonly runningService: RunningService,
    private readonly multiRoomRepository: MultiRoomRepository,
    private readonly multiRoomMemberRepository: MultiRoomMemberRepository,
    private globalCacheService: GlobalCacheService,
    private readonly socketGateway: SocketGateway,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async runEnd(
    user: DeserializeAccessToken,
    body: MultiRunningRequest,
  ): Promise<RunningResponse> {
    try {
      const userInRoomCount = await this.globalCacheService.getCache(
        `running:${body.roomId}`,
      );

      const findRoom = await this.multiRoomRepository.findById(body.roomId);

      if (Number(userInRoomCount) == 1) {
        const runningFinishJobId = await this.globalCacheService.getCache(
          `runningFinishJob:${body.roomId}`,
        );
        await this.globalCacheService.deleteCache(
          `bull:multiRun:${runningFinishJobId}`,
        );
        await this.globalCacheService.deleteCache(
          `runningFinishJob:${body.roomId}`,
        );

        await this.globalCacheService.deleteCache(`running:${body.roomId}`);
        this.socketGateway.server
          .in(String(body.roomId))
          .emit('finish', '모든 유저가 다 달렸습니다.');
      } else {
        await this.globalCacheService.setCache(
          `running:${body.roomId}`,
          String(Number(userInRoomCount) - 1),
          { ttl: findRoom.targetTime / 1000 },
        );
      }

      delete body.roomId;
      const runningResponse = await this.runningService.runEnd(user, body);
      const testLogging =
        await this.multiRoomMemberRepository.updateRunIdByUserIdAndRoomId(
          runningResponse.id,
          body.roomId,
          user.id,
        );
      console.log(testLogging);

      return runningResponse;
    } catch (err) {
      console.error(err);
      throw new HttpException(err.message ? err.message : err, 500);
    }
  }
}
