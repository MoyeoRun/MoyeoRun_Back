import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { getKstTime } from 'src/common/utils/day.util';
import { getDistance } from 'src/common/utils/distance.util';
import { RunningRequest } from '../dto/running.dto';
import {
  SingleRunningResponse,
  SingleRunningStartRequest,
} from '../dto/single-running.dto';
import { RunningRespository } from '../running.repository';

@Injectable()
export class SingleRunningService {
  constructor(private readonly runningRepository: RunningRespository) {}

  async runStart(
    user: DeserializeAccessToken,
    body: SingleRunningStartRequest,
  ): Promise<SingleRunningResponse> {
    try {
      const result = await this.runningRepository.create('single', user, {
        currentDistance: 0,
        currentPace: 0,
        ...body,
      });

      return result.responseData;
    } catch (err) {
      console.error(err);
      throw new BadRequestException('BadRequest');
    }
  }

  async running(body: RunningRequest): Promise<SingleRunningResponse> {
    try {
      const findRunning = await this.runningRepository.findById(body.id);
      if (!findRunning) {
        throw new HttpException('러닝이 존재하지 않습니다', 400);
      }

      let lastRunData;
      const nextRunDataArray = [];
      let newDistance;
      for (let i = 0; i < body.runData.length; i++) {
        //다음 좌표와의 거리 구하기
        let lastRunDistance;
        if (i === 0) {
          lastRunData = findRunning.runData[findRunning.runData.length - 1];
          lastRunDistance = findRunning.runDistance;
        } else {
          lastRunData = nextRunDataArray[i - 1];
          lastRunDistance = lastRunData.currentDistance;
        }

        const distance = getDistance(
          lastRunData.latitude,
          lastRunData.longitude,
          body.runData[i].latitude,
          body.runData[i].longitude,
        );
        //새 거리 계산
        newDistance = lastRunDistance + distance;
        //순간 페이스 구하기 (2초마다 데이터를 주면, 2s/거리)
        const currentPace = 2 / distance; //distance: km단위,currentPace / 60-> 분 페이스
        const nextRunData = {
          latitude: body.runData[i].latitude,
          longitude: body.runData[i].longitude,
          currentDistance: newDistance,
          currentPace: currentPace / 60,
        };
        nextRunDataArray.push(nextRunData);
      }
      //시간 차이 계산(s)
      const betweenTime = dayjs(getKstTime()).diff(
        findRunning.createdAt,
        'second',
      );
      //평균페이스
      const averagePace = betweenTime / newDistance / 60;

      const updateRunning = await this.runningRepository.updateOneRunning({
        id: body.id,
        runPace: averagePace,
        runDistance: newDistance,
        runData: nextRunDataArray,
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
      const TotalrunTime = lastRunData.currentPace * findRunning.runDistance;

      const updateRunning = await this.runningRepository.updateRunningEnd(
        id,
        TotalrunTime,
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
