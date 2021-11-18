import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationServerRequest } from './notification.dto';

@Controller('noti')
export class NotificationController {
  constructor(private noti: NotificationService) {}

  @Post()
  sendNotification(@Body() body: NotificationServerRequest) {
    this.noti.sendNotification({
      title: body.title,
      body: body.body,
      data: body.data,
      token: body.token,
    });
  }
}
