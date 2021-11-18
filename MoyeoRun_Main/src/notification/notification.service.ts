import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { kafkaServerId } from 'src/common/utils/kafka.util';
import { NotificationServerRequest } from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(@Inject(kafkaServerId) private readonly client: ClientKafka) {}

  sendNotification(notificationRequest: NotificationServerRequest) {
    return this.client.emit('notification', {
      notification: {
        title: notificationRequest.title,
        body: notificationRequest.body,
      },
      data: notificationRequest.data,
      token: notificationRequest.token,
    });
  }
}
