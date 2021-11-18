import { IsObject, IsString } from 'class-validator';

export class NotificationServerRequest {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsObject()
  data: Record<string, unknown>;

  @IsString()
  token: string;
}
