import { IsArray, IsString } from 'class-validator';

interface RunData {
  time: Date;
  latitude: number;
  longitude: number;
}

export class RunningRequest {
  @IsString()
  id: string;

  @IsArray()
  runData: Array<RunData>;
}
