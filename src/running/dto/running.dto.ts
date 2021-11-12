import {
  IsArray,
  IsDate,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { RunDataType } from '../running.type';
import { SingleRunningRequest } from './single-running.dto';

interface RunData {
  time: number;
  latitude: number;
  longitude: number;
}

export class RunningRequest {
  @IsString()
  id: string;

  @IsArray()
  runData: Array<RunData>;
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
  runningList: RunningResponse[];
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

export class RunSummary {
  @IsNumber()
  section: number;

  @IsNumber()
  averagePaceOfSection: number;

  @IsNumber()
  relativeAltitudeOfSection: number;

  @IsNumber()
  latitudeOfSection: number;

  @IsNumber()
  longitudeOfSection: number;
}

export class RunningResponse extends SingleRunningRequest {
  @IsObject()
  user: DeserializeAccessToken;

  @IsString()
  id: string;

  @IsOptional()
  @IsArray()
  runSummary?: RunSummary[];

  @IsDate()
  createdAt: Date;
}
