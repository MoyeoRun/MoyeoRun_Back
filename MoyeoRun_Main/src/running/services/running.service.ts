import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Connection } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { MultiRoomMemberRepository } from 'src/repository/multi-room-member.repository';
import { MultiRoomRepository } from 'src/repository/multi-room.repository';
import { MultiListElement } from '../dto/multi-room.dto';
import {
  analysisRunningListBetweenTerm,
  MultiRunningListResponse,
  RunningListRequest,
  RunningRequest,
  RunningResponse,
  RunSummary,
  SingleRunningListResponse,
} from '../dto/running.dto';
import { RunDataRepository } from '../repositories/run-data.repository';
import { RunningRepository } from '../repositories/running.repository';
import { RunningType } from '../running.type';
import { Runnings } from '../schemas/runnings.schema';

@Injectable()
export class RunningService {
  constructor(
    private readonly runningRepository: RunningRepository,
    private readonly runDataRepository: RunDataRepository,
    private readonly multiRoomMemberRepository: MultiRoomMemberRepository,
    private readonly multiRoomRepository: MultiRoomRepository,
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

  private calculatePace(previousRun, currentRun) {
    return (
      (currentRun.currentTime - previousRun.time) /
      (currentRun.currentDistance - previousRun.distance) /
      1000 /
      60
    );
  }

  private getSectionOfRunningAtDoubleArray(runData: any): RunSummary[] {
    const runSummary: RunSummary[] = [];
    let section = 0;
    const previousRun = {
      time: 0,
      distance: 0,
    };
    runData.map((runSection) => {
      runSection.map((run) => {
        if (section >= Math.floor(run.currentDistance)) return;
        section++;
        runSummary.push({
          section,
          averagePaceOfSection: this.calculatePace(previousRun, run),
          relativeAltitudeOfSection:
            run.currentAltitude - runData[0][0].currentAltitude,
          latitudeOfSection: run.latitude,
          longitudeOfSection: run.longitude,
        });
        previousRun.time = run.currentTime;
        previousRun.distance = run.currentDistance;
      });
    });

    return runSummary;
  }

  private getSectionOfRunningAtSingleArray(runData: any): RunSummary[] {
    const runSummary: RunSummary[] = [];
    let section = 0;
    const previousRun = {
      time: 0,
      distance: 0,
    };
    runData.map((run) => {
      if (section >= Math.floor(run.currentDistance)) return;
      section++;
      runSummary.push({
        section,
        averagePaceOfSection: this.calculatePace(previousRun, run),
        relativeAltitudeOfSection:
          run.currentAltitude - runData[0].currentAltitude,
        latitudeOfSection: run.latitude,
        longitudeOfSection: run.longitude,
      });
      previousRun.time = run.currentTime;
      previousRun.distance = run.currentDistance;
    });
    return runSummary;
  }

  private async calculateTerm(
    user: DeserializeAccessToken,
    type: RunningType,
    params: RunningListRequest,
  ): Promise<{
    totalDistance: number;
    totalTime: number;
    totalAveragePace: number;
    analysisRunningListBetweenTerm: analysisRunningListBetweenTerm[];
    findRunning: Runnings[];
  }> {
    let findRunning: Runnings[];
    if (type === RunningType['multi']) {
      findRunning = await this.runningRepository.findByUserAndMultiBetweenTerm(
        user,
        new Date(params.start),
        new Date(params.end),
      );
    } else {
      findRunning =
        await this.runningRepository.findByUserAndNotMultiBetweenTerm(
          user,
          new Date(params.start),
          new Date(params.end),
        );
    }

    if (!findRunning) {
      throw new HttpException('러닝이 존재하지 않습니다', 204);
    }

    const analysisRunningListBetweenTerm =
      await this.runningRepository.countByCreatedAtBetweenTerm(
        user,
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

    return {
      totalDistance,
      totalTime,
      totalAveragePace,
      analysisRunningListBetweenTerm,
      findRunning,
    };
  }

  async getRunning(id: string): Promise<RunningResponse> {
    try {
      const findRunning = await this.runningRepository.findById(id);
      const findRunData = await this.runDataRepository.findByRunningsId(
        findRunning.id,
      );

      if (!findRunning) {
        throw new HttpException('러닝이 존재하지 않습니다', 404);
      }

      let runSummary: RunSummary[];
      if (findRunData.runData[0].constructor == Array)
        runSummary = this.getSectionOfRunningAtDoubleArray(findRunning.runData);
      else
        runSummary = this.getSectionOfRunningAtSingleArray(findRunning.runData);

      return {
        ...findRunning.responseData,
        runSummary,
        runData: findRunData.runData,
      };
    } catch (err) {
      console.error(err);
      throw new BadRequestException(err);
    }
  }

  async getSingleRunList(
    user: DeserializeAccessToken,
    params: RunningListRequest,
  ): Promise<SingleRunningListResponse> {
    try {
      const {
        totalDistance,
        totalAveragePace,
        totalTime,
        analysisRunningListBetweenTerm,
        findRunning,
      } = await this.calculateTerm(user, RunningType['free'], params);

      const runningListResponse: SingleRunningListResponse = {
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

  async getMultiRunList(
    user: DeserializeAccessToken,
    params: RunningListRequest,
  ): Promise<MultiRunningListResponse> {
    const {
      totalDistance,
      totalAveragePace,
      totalTime,
      analysisRunningListBetweenTerm,
    } = await this.calculateTerm(user, RunningType['multi'], params);
    const multiList =
      await this.multiRoomMemberRepository.findByUserIdWithMultiRoomBetweenTerm(
        user.id,
        new Date(params.start),
        new Date(params.end),
      );
    const multiListResponse: MultiListElement[] = [];

    multiList.map((multiRoom) => {
      const rank = multiRoom.multiRoom.multiRoomMember[0].rank;
      delete multiRoom.multiRoom.multiRoomMember;
      multiListResponse.push({
        multiRoom: multiRoom.multiRoom,
        rank,
      });
    });

    const runningListResponse: MultiRunningListResponse = {
      totalTime,
      totalDistance,
      totalAveragePace,
      analysisRunningListBetweenTerm,
      runningList: multiListResponse,
    };
    return runningListResponse;
  }

  async getMultiRun(user: DeserializeAccessToken, id: number) {
    const multiRoomWithMember =
      await this.multiRoomRepository.findByUserIdWithMultiRoomMember(
        Number(id),
      );
    const myMultiRoomInfo = multiRoomWithMember.multiRoomMember.filter(
      (data) => data.userId === user.id,
    );

    const myRunData = await this.getRunning(myMultiRoomInfo[0].runId);
    return {
      multiRoomWithMember,
      myRunData,
    };
  }

  async runEnd(
    user: DeserializeAccessToken,
    body: RunningRequest,
  ): Promise<RunningResponse> {
    try {
      const sliceSingleRun = _.cloneDeep(body);
      if (sliceSingleRun.runData[0].constructor == Array)
        sliceSingleRun.runData = this.sliceRunData(sliceSingleRun.runData);
      else sliceSingleRun.runData = sliceSingleRun.runData.slice(0, 49);

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
      console.error(err);
      throw new HttpException(err.message ? err.message : err, 500);
    }
  }
}
