import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
} from 'class-validator';
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
