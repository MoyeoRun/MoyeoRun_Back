import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const nestConfig = app.get(ConfigService);

  await app.listen(nestConfig.get('port'), nestConfig.get('host'));
}

bootstrap();
