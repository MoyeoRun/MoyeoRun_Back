import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAccessAuthGuard } from 'src/auth/guards/access-jwt-auth.guard';
import { KafkaService } from 'src/kafka/kafka.service';

@Controller('images')
export class ImageController {
  constructor(private noti: KafkaService) {}
  @UseGuards(JwtAccessAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file;
  }

  @Get('test')
  testII() {
    this.noti.sendNotification({
      notification: {
        title: 'ok~',
        body: 'test',
      },
      body: {
        test: 'test',
      },
      token:
        'dhwXTeysRFugDjM35EfjU0:APA91bGoz_vGBc6GnQRMX1YmZ9CrMgcdzD4MN603U1IEilMJpzdmfCx4tQqaDGPSTeiKKddpcmIxdAoBrZhbbHKZ-cfy8Z9qOPtpGw0aJ7ynpU23ARIbmrVrZbAQXsSEz95lajSS4tp_',
    });
  }
}
