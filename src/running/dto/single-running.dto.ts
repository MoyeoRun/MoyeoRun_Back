import { PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Runnings } from '../schemas/running.schema';

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
