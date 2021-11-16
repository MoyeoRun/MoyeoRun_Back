import { Body, Controller, Post } from '@nestjs/common';
import { KafkaService } from 'src/kafka/kafka.service';
import { TestNotificationRequest } from './notification.dto';

@Controller('noti')
export class NotificationController {
  constructor(private noti: KafkaService) {}

  @Post()
  sendNotification(@Body() body: TestNotificationRequest) {
    this.noti.sendNotification({
      notification: {
        title: body.title,
        body: body.body,
      },
      body: body.data,
      token: body.token,
    });
  }
}
