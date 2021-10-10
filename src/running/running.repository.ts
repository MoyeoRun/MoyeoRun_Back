import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { getKstTime } from 'src/common/utils/day.util';
import { updateRunningDatebase } from './dto/single-running.dto';
import { dbRunData, Runnings } from './schemas/running.schema';

@Injectable()
export class RunningRespository {
  constructor(
    @InjectModel(Runnings.name) private runningModel: Model<Runnings>,
  ) {}

  async create(
    type: string,
    user: DeserializeAccessToken,
    runData: dbRunData,
  ): Promise<Runnings> {
    return await this.runningModel.create({
      type,
      user,
      runData,
      createdAt: getKstTime(),
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
  }: updateRunningDatebase): Promise<Runnings> {
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
