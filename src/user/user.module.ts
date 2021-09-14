import { Module } from '@nestjs/common';
import { UserRepository } from 'src/common/repositories/user.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserDao } from './user.dao';

@Module({
  imports: [PrismaModule.import([UserRepository])],
  providers: [UserDao, UserService],
  exports: [UserDao],
  controllers: [UserController],
})
export class UserModule {}
