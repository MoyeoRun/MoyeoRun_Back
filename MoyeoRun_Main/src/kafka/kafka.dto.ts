import { IsObject, IsString } from 'class-validator';

export class NotificationRequest {
  @IsObject()
  notification: {
    title: string;
    body: string;
  };

  @IsObject()
  body: Record<string, unknown>;

  @IsString()
  token: string;
}
