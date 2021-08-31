import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService: PrismaService = app.get(PrismaService);
  app.useGlobalFilters(new HttpExceptionFilter());
  prismaService.enableShutdownHooks(app);
  app.useGlobalPipes(new ValidationPipe());
  const nestConfig = app.get(ConfigService);
  await app.listen(nestConfig.get('port'), nestConfig.get('host'));
}

bootstrap();
