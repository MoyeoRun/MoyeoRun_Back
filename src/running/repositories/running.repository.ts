import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import {
  SingleRunningRequest,
  updateRunningDatabase,
} from '../dto/single-running.dto';
import { Runnings } from '../schemas/runnings.schema';

@Injectable()
export class RunningRepository {
  constructor(
    @InjectModel(Runnings.name) private runningModel: Model<Runnings>,
  ) {}

  async create(
    data: SingleRunningRequest,
    user: DeserializeAccessToken,
    session: ClientSession,
  ): Promise<Runnings> {
    return await this.runningModel.create({
      ...data,
      user,
      $session: session,
    });
  }

  async findById(id: string): Promise<Runnings> {
    return await this.runningModel.findOne().where({ _id: id });
  }

  async findByUser(user: DeserializeAccessToken): Promise<Runnings[]> {
    return await this.runningModel.find().where({
      user,
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
}
