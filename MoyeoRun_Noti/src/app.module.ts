import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import nestConfig from './config/nest.config';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [nestConfig],
    }),
    KafkaModule,
  ],
})
export class AppModule {}
