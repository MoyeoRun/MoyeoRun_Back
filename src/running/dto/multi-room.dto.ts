import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MultiRoomCreateRequest {
  @IsOptional()
  @IsString()
  roomImage?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  startTime: string;

  @IsNumber()
  limitTime: number;

  @IsNumber()
  limitMember: number;

  @IsNumber()
  targetDistance: number;
}
export class MultiRoomRequest {
  @IsNumber()
  roomId: number;
}
