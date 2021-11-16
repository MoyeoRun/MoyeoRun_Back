import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAccessAuthGuard } from 'src/auth/guards/access-jwt-auth.guard';

@Controller('images')
export class ImageController {
  @UseGuards(JwtAccessAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file;
  }
}
