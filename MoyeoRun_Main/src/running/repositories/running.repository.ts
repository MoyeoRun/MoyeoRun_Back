import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import {
  analysisRunningListBetweenTerm,
  RunningRequest,
  updateRunningDatabase,
} from '../dto/running.dto';
import { Runnings } from '../schemas/runnings.schema';

@Injectable()
export class RunningRepository {
  constructor(
    @InjectModel(Runnings.name) private runningModel: Model<Runnings>,
  ) {}

  async create(
    data: RunningRequest,
    user: DeserializeAccessToken,
    session: ClientSession,
  ): Promise<Runnings> {
    return await this.runningModel.create({
      ...data,
      user,
      $session: session,
    });
  }

  async createForMulti(user: DeserializeAccessToken): Promise<Runnings> {
    return await this.runningModel.create({ user, type: 'multi' });
  }

  async findById(id: string): Promise<Runnings> {
    return await this.runningModel.findOne().where({ _id: id });
  }

  async findByUserBetweenTerm(
    user: DeserializeAccessToken,
    start: Date,
    end: Date,
  ): Promise<Runnings[]> {
    return await this.runningModel.find({
      user: user,
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });
  }

  async updateOneRunning({
    id,
    runDistance,
    runPace,
    runData,
  }: updateRunningDatabase): Promise<Runnings> {
    return await this.runningModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          runDistance,
          runPace,
        },
        $push: {
          runData: {
            $each: runData,
          },
        },
      },
      { new: true },
    );
  }

  async updateRunningEnd(id: string, runTime: number): Promise<Runnings> {
    return await this.runningModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          runTime,
        },
      },
      { new: true },
    );
  }

  async countByCreatedAtBetweenTerm(
    user: DeserializeAccessToken,
    start: Date,
    end: Date,
  ): Promise<analysisRunningListBetweenTerm[]> {
    return await this.runningModel.aggregate([
      { $match: { user: user } },
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          distance: { $sum: '$runDistance' },
          time: { $sum: '$runTime' },
          pace: { $avg: '$runPace' },
          first: { $min: '$createdAt' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$first',
          count: 1,
          totalDistanceOfTerm: '$distance',
          totalTimeOfTerm: '$time',
          averagePaceOfTerm: '$pace',
          _id: 0,
        },
      },
    ]);
  }
}
