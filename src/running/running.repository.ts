import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { getKstTime } from 'src/common/utils/dayUtil';
import { RunningDataDto } from './dto/running.dto';
import { updateRunningDatebaseDto } from './dto/single-running.dto';
import { Runnings } from './schemas/running.schema';

@Injectable()
export class RunningRespository {
  constructor(
    @InjectModel(Runnings.name) private runningModel: Model<Runnings>,
  ) {}

  async create(
    type: string,
    user: DeserializeAccessToken,
    runData: RunningDataDto,
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

  async updateOneRunning({
    id,
    runDistance,
    runPace,
    runData,
  }: updateRunningDatebaseDto): Promise<Runnings> {
    return await this.runningModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          runDistance,
          runPace,
        },
        $push: {
          runData,
        },
      },
    );
  }
}
