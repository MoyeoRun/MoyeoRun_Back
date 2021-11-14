import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [PrismaModule.import([UserRepository])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
