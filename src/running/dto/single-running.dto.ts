import {
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { dbRunData } from '../schemas/running.schema';

export enum RunningType {
  multi = 'multi',
  free = 'free',
  distance = 'distance',
  time = 'time',
}

export class SingleRunningStartRequest {
  @IsEnum(RunningType)
  type: RunningType;

  @IsOptional()
  @IsNumber()
  targetTime?: number;

  @IsOptional()
  @IsNumber()
  targetDistance?: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class SingleRunningResponse {
  @IsObject()
  user: DeserializeAccessToken;

  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  targetTime?: number;

  @IsOptional()
  @IsNumber()
  targetDistance?: number;

  @IsString()
  id: string;

  @IsNumber()
  runPace: number;

  @IsNumber()
  runTime: number;

  @IsDate()
  createdAt: Date;

  @IsNumber()
  runDistance: number;

  @IsObject()
  runData: dbRunData;
}

export class updateRunningDatabase {
  @IsString()
  id: string;

  @IsNumber()
  runPace: number;

  @IsNumber()
  runDistance: number;

  @IsObject()
  runData: dbRunData[];
}
