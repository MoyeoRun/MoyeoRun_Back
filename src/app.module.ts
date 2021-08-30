import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import nestConfig from './config/nest.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [nestConfig],
    }),
  ],
})
export class AppModule {}
