import { MultiRoom } from '.prisma/client';
import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

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

export class MultiListElement {
  @IsObject()
  multiRoom: MultiRoom;

  @IsNumber()
  rank: number;
}
