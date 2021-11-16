import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { kafkaServerId } from 'src/common/utils/kafka.util';
import { NotificationService } from 'src/notification/notification.service';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'kafkaServerId',
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
  controllers: [KafkaController],
})
export class KafkaModule {}
