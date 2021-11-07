import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate, IsEnum, IsNumber, IsObject } from 'class-validator';
import { Document } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { SingleRunningResponse } from '../dto/single-running.dto';
import { RunDataType, RunningType } from '../running.type';

@Schema()
export class Runnings extends Document {
  @Prop({
    required: true,
  })
  @IsObject()
  user: DeserializeAccessToken;

  @Prop({
    required: true,
  })
  @IsEnum(RunningType)
  type: RunningType;

  @Prop({
    required: false,
  })
  @IsNumber()
  targetDistance: number;

  @Prop({
    required: false,
  })
  @IsDate()
  targetTime: number;

  @Prop({
    required: false,
    default: 0,
  })
  @IsNumber()
  runTime: number;

  @Prop({
    required: false,
    default: 0,
  })
  @IsNumber()
  runPace: number;

  @Prop({
    required: false,
    default: 0,
  })
  @IsNumber()
  runDistance: number;

  @Prop({
    required: true,
    default: Date.now,
  })
  @IsDate()
  createdAt: Date;

  @Prop()
  runData: RunDataType[][] | RunDataType[];

  readonly responseData: SingleRunningResponse;
}

const _RunningSchema = SchemaFactory.createForClass(Runnings);

_RunningSchema.virtual('id').set(function (this: Runnings) {
  return this._id.toHexString();
});
_RunningSchema.set('toJSON', {
  virtuals: true,
});
_RunningSchema.set('toObject', { virtuals: true });

_RunningSchema.virtual('responseData').get(function (this: Runnings) {
  return {
    id: this.id,
    user: this.user,
    type: this.type,
    targetDistance: this.targetDistance,
    targetTime: this.targetTime,
    runPace: this.runPace,
    runTime: this.runTime,
    runDistance: this.runDistance,
    createdAt: this.createdAt,
    runData: this.runData,
  };
});

export const RunningSchema = _RunningSchema;
