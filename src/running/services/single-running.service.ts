import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Connection } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import {
  RunningListRequest,
  RunningListResponse,
  SingleRunningRequest,
  SingleRunningResponse,
} from '../dto/single-running.dto';
import { RunDataRepository } from '../repositories/run-data.repository';
import { RunningRepository } from '../repositories/running.repository';
import { Runnings } from '../schemas/runnings.schema';
@Injectable()
export class SingleRunningService {
  constructor(
    private readonly runningRepository: RunningRepository,
    private readonly runDataRepository: RunDataRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private sliceRunData(runData: any): any {
    const returnArray = [];
    let count = 0,
      index = 0;

    let fullRunDataLength = 0;
    runData.map((section) => (fullRunDataLength += section.length));
    while (count < 50 && count != fullRunDataLength) {
      const length = runData[index].length;
      console.log(`${index}: ${length}`);
      returnArray.push(
        count + length >= 50
          ? runData[index].slice(0, 50 - count)
          : runData[index],
      );
      count += length;
      index++;
    }
    return returnArray;
  }
  async runStart(
    user: DeserializeAccessToken,
    body: SingleRunningRequest,
  ): Promise<SingleRunningResponse> {
    try {
      const sliceSingleRun = _.cloneDeep(body);

      if (sliceSingleRun.runData[0].constructor == Array)
        sliceSingleRun.runData = this.sliceRunData(sliceSingleRun.runData);

      const transactionSession = await this.connection.startSession();
      transactionSession.startTransaction();

      let createSingleRun: Runnings;
      try {
        createSingleRun = await this.runningRepository.create(
          sliceSingleRun,
          user,
          transactionSession,
        );
        await this.runDataRepository.create(body.runData, createSingleRun.id);

        await transactionSession.commitTransaction();
      } catch (err) {
        console.error(err);
        await transactionSession.abortTransaction();
        throw new HttpException(err, 500);
      }

      transactionSession.endSession();

      return createSingleRun.responseData;
    } catch (err) {
      throw new HttpException(err, 500);
    }
  }

  async getRunning(id: string): Promise<SingleRunningResponse> {
    try {
      const findRunning = await this.runningRepository.findById(id);
      const findRunData = await this.runDataRepository.findByRunningsId(
        findRunning.id,
      );

      if (!findRunning) {
        throw new HttpException('러닝이 존재하지 않습니다', 400);
      }
      return {
        ...findRunning.responseData,
        runData: findRunData.runData,
      };
    } catch (err) {
      console.error(err);
      throw new BadRequestException(err);
    }
  }

  async getList(
    user: DeserializeAccessToken,
    params: RunningListRequest,
  ): Promise<RunningListResponse> {
    try {
      const findRunning = await this.runningRepository.findByUserBetweenTerm(
        user,
        new Date(params.start),
        new Date(params.end),
      );

      if (!findRunning) {
        throw new HttpException('러닝이 존재하지 않습니다', 400);
      }

      const analysisRunningListBetweenTerm =
        await this.runningRepository.countByCreatedAtBetweenTerm(
          new Date(params.start),
          new Date(params.end),
        );

      let totalDistance = 0,
        totalTime = 0,
        totalAveragePace = 0;

      analysisRunningListBetweenTerm.map((data) => {
        totalDistance += data.totalDistanceOfTerm;
        totalTime += data.totalTimeOfTerm;
        totalAveragePace += data.averagePaceOfTerm;
      });
      totalAveragePace /= analysisRunningListBetweenTerm.length;

      const runningListResponse: RunningListResponse = {
        totalTime,
        totalDistance,
        totalAveragePace,
        analysisRunningListBetweenTerm,
        runningList: [],
      };
      findRunning.map((running) =>
        runningListResponse.runningList.push(running.responseData),
      );

      return runningListResponse;
    } catch (err) {
      console.error(err);
      throw new BadRequestException('BadRequest');
    }
  }
}
