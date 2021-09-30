import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [PrismaModule.import([UserRepository]), AuthModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
