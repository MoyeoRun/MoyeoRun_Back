import {
  IsArray,
  IsDate,
  IsDateString,
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

export class RunningListRequest {
  @IsDateString()
  start: Date;

  @IsDateString()
  end: Date;
}

export class RunningListResponse {
  @IsNumber()
  totalDistance: number;

  @IsNumber()
  totalAveragePace: number;

  @IsNumber()
  totalTime: number;

  @IsObject()
  analysisRunningListBetweenTerm: analysisRunningListBetweenTerm[];

  @IsObject()
  runningList: SingleRunningResponse[];
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

export class analysisRunningListBetweenTerm {
  @IsDate()
  date: Date;

  @IsNumber()
  count: number;

  @IsNumber()
  totalDistanceOfTerm: number;

  @IsNumber()
  totalTimeOfTerm: number;

  @IsNumber()
  averagePaceOfTerm: number;
}
