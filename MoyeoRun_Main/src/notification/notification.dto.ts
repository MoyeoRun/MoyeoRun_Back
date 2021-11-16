import { IsObject, IsString } from 'class-validator';

export class TestNotificationRequest {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsObject()
  data: Record<string, unknown>;

  @IsString()
  token: string;
}
