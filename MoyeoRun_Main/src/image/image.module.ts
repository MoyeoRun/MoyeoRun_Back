import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { KafkaModule } from 'src/kafka/kafka.module';
import { ImageController } from './image.controller';
import { S3Service } from './s3.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: S3Service,
    }),
    KafkaModule,
  ],
  controllers: [ImageController],
})
export class ImageModule {}
