import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { kafkaServerId } from 'src/common/utils/kafka.util';
import { KafkaService } from './kafka.service';

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
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
