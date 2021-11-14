import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { kafkaServerId } from 'src/common/utils/kafka.util';
import { NotificationRequest } from './kafka.dto';

@Injectable()
export class KafkaService {
  constructor(@Inject(kafkaServerId) private readonly client: ClientKafka) {}

  sendNotification(notificationRequest: NotificationRequest) {
    return this.client.emit('notification', {
      notification: notificationRequest.notification,
      data: notificationRequest.body,
      token: notificationRequest.token,
    });
  }
}
