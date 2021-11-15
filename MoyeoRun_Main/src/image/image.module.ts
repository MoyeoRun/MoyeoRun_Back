import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImageController } from './image.controller';
import { S3Service } from './s3.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: S3Service,
    }),
  ],
  controllers: [ImageController],
})
export class ImageModule {}
