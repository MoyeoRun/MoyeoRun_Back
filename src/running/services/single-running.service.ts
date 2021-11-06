import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { subTime } from 'src/common/utils/day.util';
import { getDistance } from 'src/common/utils/distance.util';
import { RunningRequest } from '../dto/running.dto';
import {
  SingleRunningResponse,
  SingleRunningStartRequest,
} from '../dto/single-running.dto';
import { RunningRepository } from '../running.repository';
import { dbRunData } from '../schemas/running.schema';

@Injectable()
export class SingleRunningService {
  constructor(private readonly runningRepository: RunningRepository) {}

  async runStart(
    user: DeserializeAccessToken,
    body: SingleRunningStartRequest,
  ): Promise<SingleRunningResponse> {
    try {
      const result = await this.runningRepository.create(
        body.type,
        user,
        {
          currentTime: body.time,
          currentDistance: 0,
          currentPace: 0,
          latitude: body.latitude,
          longitude: body.longitude,
        },
        body.targetDistance,
        body.targetTime,
      );

      return result.responseData;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException)
        throw new HttpException(err.message, err.getStatus());
      else throw new HttpException(err, 500);
    }
  }

  async running(body: RunningRequest): Promise<SingleRunningResponse> {
    try {
      const findRunning = await this.runningRepository.findById(body.id);
      if (!findRunning) {
        throw new HttpException('러닝이 존재하지 않습니다', 400);
      }

      let lastRunData: dbRunData;
      const currentRunningDataArray: dbRunData[] = [];
      let currentDistance;
      for (let i = 0; i < body.runData.length; i++) {
        //다음 좌표와의 거리 구하기
        let lastRunDistance;
        if (i === 0) {
          lastRunData = findRunning.runData[findRunning.runData.length - 1];
          lastRunDistance = findRunning.runDistance;
        } else {
          lastRunData = currentRunningDataArray[i - 1];
          lastRunDistance = lastRunData.currentDistance;
        }

        const distance = getDistance(
          lastRunData.latitude,
          lastRunData.longitude,
          body.runData[i].latitude,
          body.runData[i].longitude,
        );
        //새 거리 계산
        currentDistance = lastRunDistance + distance;
        //순간 페이스 구하기 (2초마다 데이터를 주면, 2s/거리)
        const currentPace =
          subTime(body.runData[i].time, lastRunData.currentTime) / distance; //distance: km단위,currentPace / 60-> 분 페이스
        const nextRunData = {
          latitude: body.runData[i].latitude,
          longitude: body.runData[i].longitude,
          currentDistance: currentDistance,
          currentPace: currentPace / 60,
          currentTime: body.runData[i].time,
        };
        currentRunningDataArray.push(nextRunData);
      }

      //시간 차이 계산(s)
      const betweenTime = subTime(
        currentRunningDataArray[currentRunningDataArray.length - 1].currentTime,
        findRunning.createdAt,
      );

      //평균페이스
      const averagePace = betweenTime / currentDistance / 60;

      const updateRunning = await this.runningRepository.updateOneRunning({
        id: body.id,
        runPace: averagePace,
        runDistance: currentDistance,
        runData: currentRunningDataArray,
      });

      if (!updateRunning) {
        throw new HttpException('DB Error', 500);
      }

      return updateRunning.responseData;
    } catch (err) {
      console.error(err);
      throw new BadRequestException('BadRequest');
    }
  }

  async runEnd(id: string): Promise<SingleRunningResponse> {
    try {
      const findRunning = await this.runningRepository.findById(id);
      if (!findRunning) {
        throw new HttpException('러닝이 존재하지 않습니다', 400);
      }
      const lastRunData = findRunning.runData[findRunning.runData.length - 1];
      const totalRunTime = lastRunData.currentPace * findRunning.runDistance;

      const updateRunning = await this.runningRepository.updateRunningEnd(
        id,
        totalRunTime * 60,
      );

      if (!updateRunning) {
        throw new HttpException('DB Error', 500);
      }
      return updateRunning.responseData;
    } catch (err) {
      console.error(err);
      throw new BadRequestException('BadRequest');
    }
  }

  async getRunning(id: string): Promise<SingleRunningResponse> {
    try {
      const findRunning = await this.runningRepository.findById(id);
      if (!findRunning) {
        throw new HttpException('러닝이 존재하지 않습니다', 400);
      }
      return findRunning.responseData;
    } catch (err) {
      console.error(err);
      throw new BadRequestException('BadRequest');
    }
  }

  async getList(
    user: DeserializeAccessToken,
  ): Promise<SingleRunningResponse[]> {
    try {
      const findRunning = await this.runningRepository.findByUser(user);

      if (!findRunning) {
        throw new HttpException('러닝이 존재하지 않습니다', 400);
      }

      return findRunning.map((running) => running.responseData);
    } catch (err) {
      console.error(err);
      throw new BadRequestException('BadRequest');
    }
  }
}
