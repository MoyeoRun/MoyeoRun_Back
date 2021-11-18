import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { kafkaServerId } from 'src/common/utils/kafka.util';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: kafkaServerId,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: kafkaServerId,
            brokers: ['kafka:9092'],
          },
          consumer: {
            groupId: 'notification',
          },
        },
      },
    ]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
