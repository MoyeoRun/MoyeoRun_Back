import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where: email });
  }

  async findByNickName(
    nickName: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where: nickName });
  }

  async updateByEmail(
    email: Prisma.UserWhereUniqueInput,
    userUpdateInput: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    return this.prisma.user.update({
      where: email,
      data: userUpdateInput,
    });
  }
}
