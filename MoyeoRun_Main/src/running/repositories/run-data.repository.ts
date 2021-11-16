import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RunDataType } from '../running.type';
import { RunData } from '../schemas/run-data.schema';

@Injectable()
export class RunDataRepository {
  constructor(
    @InjectModel(RunData.name) private runDataModel: Model<RunData>,
  ) {}

  async create(
    runData: RunDataType[] | RunDataType[][],
    runningsId: string,
  ): Promise<RunData> {
    return await this.runDataModel.create({
      runData,
      runningsId,
    });
  }

  async findByRunningsId(runningsId: string): Promise<RunData> {
    return await this.runDataModel.findOne().where({ runningsId });
  }
}
