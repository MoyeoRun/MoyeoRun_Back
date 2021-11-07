import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateIf,
} from 'class-validator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { RunDataType, RunningType } from '../running.type';

export class SingleRunningRequest {
  @IsEnum(RunningType)
  type: RunningType;

  @ValidateIf((o) => o.type === RunningType.time)
  @IsNotEmpty()
  @IsNumber()
  targetTime?: number;

  @ValidateIf((o) => o.type === RunningType.distance)
  @IsNotEmpty()
  @IsNumber()
  targetDistance?: number;

  @IsNumber()
  runPace: number;

  @IsNumber()
  runTime: number;

  @IsNumber()
  runDistance: number;

  @IsArray()
  runData: RunDataType[][] | RunDataType[];
}

export class SingleRunningResponse extends SingleRunningRequest {
  @IsObject()
  user: DeserializeAccessToken;

  @IsString()
  id: string;

  @IsDate()
  createdAt: Date;
}

export class updateRunningDatabase {
  @IsString()
  id: string;

  @IsNumber()
  runPace: number;

  @IsNumber()
  runDistance: number;

  @IsObject()
  runData: RunDataType[];
}
