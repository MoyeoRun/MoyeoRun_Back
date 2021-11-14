import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import {
  RunningListRequest,
  RunningListResponse,
  RunningResponse,
  RunSummary,
} from '../dto/running.dto';
import { RunDataRepository } from '../repositories/run-data.repository';
import { RunningRepository } from '../repositories/running.repository';

@Injectable()
export class RunningService {
  constructor(
    private readonly runningRepository: RunningRepository,
    private readonly runDataRepository: RunDataRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

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
