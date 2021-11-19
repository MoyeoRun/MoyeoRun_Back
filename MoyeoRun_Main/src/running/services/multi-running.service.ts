import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { GlobalCacheService } from 'src/cache/global.cache.service';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { MultiRoomRepository } from 'src/repository/multi-room.repository';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { SocketGateway } from 'src/socket/socket.gateway';
import { MultiRunningRequest, RunningResponse } from '../dto/running.dto';
import { RunDataRepository } from '../repositories/run-data.repository';
import { RunningRepository } from '../repositories/running.repository';
import { RunningService } from './running.service';
@Injectable()
export class MultiRunningService {
  constructor(
    private readonly runningRepository: RunningRepository,
    private readonly runDataRepository: RunDataRepository,
    private readonly runningService: RunningService,
    private readonly multiRoomRepository: MultiRoomRepository,
    private readonly multiRoomMemberRepository: MultiRoomMemberRepository,
    private readonly roomStatusRepository: RoomStatusRepository,
    private readonly globalCacheService: GlobalCacheService,
    private readonly socketGateway: SocketGateway,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async updateMultiRank(roomId: number) {
    const findMultiRoomUsers = await this.multiRoomRepository.findById(roomId);
    const multiRoomUserRunningIds = findMultiRoomUsers.multiRoomMember.map(
      (data) => data.runId,
    );
    const findMultiRoomUserRunningData =
      await this.runningRepository.findManyInMultiRoomUser(
        multiRoomUserRunningIds,
      );
    const filterRunningData = findMultiRoomUserRunningData.map(
      (data) => data.responseData,
    );

    filterRunningData.sort((a, b) => {
      if (
        a.targetDistance === a.runDistance &&
        b.targetDistance === b.runDistance
      ) {
        return a.runTime - b.runTime;
      } else if (
        a.targetDistance === a.runDistance &&
        b.targetDistance != b.runDistance
      ) {
        return -1;
      } else if (
        a.targetDistance != a.runDistance &&
        b.targetDistance === b.runDistance
      ) {
        return 1;
      } else {
        return -(a.runDistance - b.runDistance);
      }
    });

    const userRanking = filterRunningData.map((data) => data.user.id);
    let rank = 1;
    for await (const data of userRanking) {
      await this.multiRoomMemberRepository.updateRankByUserId(
        roomId,
        data,
        rank++,
      );
    }

    return true;
  }
  async runEnd(
    user: DeserializeAccessToken,
    body: MultiRunningRequest,
  ): Promise<RunningResponse> {
    try {
      const userInRoomCount = await this.globalCacheService.getCache(
        `running:${body.roomId}`,
      );

      const findRoom = await this.multiRoomRepository.findById(body.roomId);

      if (userInRoomCount) {
        if (Number(userInRoomCount) == 1) {
          const runningFinishJobId = await this.globalCacheService.getCache(
            `runningFinishJob:${body.roomId}`,
          );
          if (runningFinishJobId)
            await this.globalCacheService.deleteCache(
              `bull:multiRun:${runningFinishJobId}`,
            );
          await this.globalCacheService.deleteCache(
            `runningFinishJob:${body.roomId}`,
          );

          await this.globalCacheService.deleteCache(`running:${body.roomId}`);
          await this.multiRoomRepository.updateClose(body.roomId);
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
      }

      const roomId = body.roomId;
      delete body.roomId;
      const runningResponse = await this.runningService.runEnd(user, body);
      await this.roomStatusRepository.deleteByUserId(user.id);
      await this.multiRoomMemberRepository.updateRunIdByUserIdAndRoomId(
        runningResponse.id,
        roomId,
        user.id,
      );
      await this.updateMultiRank(roomId);

      return runningResponse;
    } catch (err) {
      console.error(err);
      throw new HttpException(err.message ? err.message : err, 500);
    }
  }
}
