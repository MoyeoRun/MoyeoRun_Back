import { Module } from '@nestjs/common';
import { UserRepository } from 'src/common/repositories/user.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserDao } from './user.dao';

@Module({
  imports: [PrismaModule.import([UserRepository])],
  providers: [UserDao],
  exports: [UserDao],
})
export class UserModule {}
