import { IsDate, IsNumber, IsObject, IsString } from 'class-validator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { dbRunData } from '../schemas/running.schema';

export class SingleRunningStartRequest {
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
