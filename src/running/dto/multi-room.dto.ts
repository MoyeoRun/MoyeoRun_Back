import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class MultiRoomCreateRequest {
  @IsOptional()
  @IsString()
  roomImage?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: Date;

  @IsNumber()
  targetTime: number;

  @IsNumber()
  limitMember: number;

  @IsNumber()
  targetDistance: number;
}
export class MultiRoomParams {
  @IsNumber()
  roomId: number;
}
