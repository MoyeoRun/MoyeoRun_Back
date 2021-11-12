import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
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
  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(nestConfig.get('port'), nestConfig.get('host'));
}

bootstrap();
