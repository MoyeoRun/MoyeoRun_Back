import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate, IsNumber, IsObject, IsString } from 'class-validator';
import { Document } from 'mongoose';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { SingleRunningResponse } from './../dto/single-running.dto';

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
    require: false,
    default: 0,
  })
  @IsNumber()
  runTime: number;

  @Prop({
    require: false,
    default: 0,
  })
  @IsNumber()
  runPace: number;

  @Prop({
    require: false,
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
  runData: dbRunData[];

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

export type dbRunData = {
  latitude: number;

  longitude: number;

  currentDistance: number;

  currentPace: number;

  currentTime: Date;
};
