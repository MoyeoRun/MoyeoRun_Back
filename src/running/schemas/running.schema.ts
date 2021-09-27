import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber, IsObject, IsString } from 'class-validator';
import { Document } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { getKstTime } from 'src/common/utils/dayUtil';
import { RunningDataDto } from './../dto/running.dto';
import { SingleRunningResponseDto } from './../dto/single-running.dto';

@Schema()
export class Runnings extends Document {
  @Prop({
    require: true,
  })
  @IsObject()
  user: DeserializeAccessToken;

  @Prop({
    require: true,
  })
  @IsString()
  type: string;

  @Prop({
    require: false,
    default: '0',
  })
  @IsString()
  runTime: string;

  @Prop({
    require: false,
    default: 0,
  })
  @IsString()
  runPace: number;

  @Prop({
    require: false,
    default: 0,
  })
  @IsNumber()
  runDistance: number;

  @Prop({
    default: getKstTime(),
  })
  createdAt: Date;

  @Prop()
  runData: RunningDataDto[];

  readonly responseData: SingleRunningResponseDto;
}

const _RunningSchema = SchemaFactory.createForClass(Runnings);

_RunningSchema.virtual('responseData').get(function (this: Runnings) {
  return {
    id: this.id,
    user: this.user,
    type: this.type,
    runPace: this.runPace,
    runTime: this.runTime,
    runDistance: this.runDistance,
    createdAt: this.createdAt,
    runData: this.runData,
  };
});

export const RunningSchema = _RunningSchema;
