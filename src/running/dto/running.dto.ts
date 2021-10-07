import { IsArray, IsString } from 'class-validator';

export type runData = {
  latitude: number;

  longitude: number;
};

export class RunningRequest {
  @IsString()
  id: string;

  @IsArray()
  runData: runData[];
}
