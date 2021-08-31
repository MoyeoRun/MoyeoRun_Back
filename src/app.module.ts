import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import nestConfig from './config/nest.config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [nestConfig],
    }),
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
