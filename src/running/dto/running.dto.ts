import { IsNumber, IsString } from 'class-validator';

export class RunningDataDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  currentDistance: number;

  @IsString()
  currentPace: number;
}

export class RunningRequestDto {
  @IsString()
  id: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
