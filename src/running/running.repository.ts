import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { RunningDataDto } from './dto/running.dto';
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
    try {
      return await this.runningModel.create({ type, user, runData });
    } catch (err) {
      console.error(err);
      throw new HttpException('db Error', 500);
    }
  }

  async findById(id: string): Promise<Runnings> {
    try {
      console.log(id);
      return await this.runningModel.findOne().where({ _id: id });
    } catch (err) {
      console.error(err);
      throw new HttpException('db Error', 500);
    }
  }
}
