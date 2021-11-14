import { MultiRoomMember, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MultiRoomMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MultiRoomMemberUncheckedCreateInput) {
    return this.prisma.multiRoomMember.create({ data });
  }

  async delete(roomId: number, userId: number) {
    return this.prisma.multiRoomMember.delete({
      where: {
        roomMember: {
          userId,
          roomId,
        },
      },
    });
  }

  async findOwner(userId: number): Promise<MultiRoomMember[]> {
    return this.prisma.multiRoomMember.findMany({
      where: {
        AND: [{ userId }, { isOwner: true }],
      },
    });
  }

  async findByUserId(userId: number): Promise<MultiRoomMember[]> {
    return this.prisma.multiRoomMember.findMany({
      where: {
        userId,
      },
    });
  }
}
