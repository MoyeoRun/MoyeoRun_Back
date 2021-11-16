import { Controller } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { NotificationService } from 'src/notification/notification.service';

@Controller()
export class KafkaController {
  constructor(private notification: NotificationService) {}

  @MessagePattern('notification')
  async readMessage(@Payload() message: any, @Ctx() context: KafkaContext) {
    const originalMessage = context.getMessage();
    const response =
      `Receiving a new message from topic: notification: ` +
      JSON.stringify(originalMessage.value);
    console.log(response);

    const { notification, data, token } = JSON.parse(
      JSON.stringify(originalMessage.value),
    );
    this.notification.sendMessage(notification, data, token);
    return response;
  }
}
