import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';
import { NotificationController } from './notification.controller';

@Module({
  imports: [KafkaModule],
  controllers: [NotificationController],
})
export class NotificationModule {}
