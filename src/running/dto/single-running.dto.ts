import { PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Runnings } from '../schemas/running.schema';
import { RunningDataDto } from './running.dto';

export class SingleRunningStartRequestDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class SingleRunningResponseDto extends PickType(Runnings, [
  'user',
  'type',
  'id',
  'runPace',
  'runTime',
  'runDistance',
  'createdAt',
  'runData',
] as const) {}

export class updateRunningDatebaseDto extends PickType(Runnings, [
  'id',
  'runPace',
  'runDistance',
] as const) {
  runData: RunningDataDto;
}
