import { MultiRoomMember, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MultiRoomMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.MultiRoomMemberUncheckedCreateInput,
  ): Promise<MultiRoomMember> {
    return this.prisma.multiRoomMember.create({ data });
  }

  async delete(roomId: number, userId: number): Promise<MultiRoomMember> {
    return this.prisma.multiRoomMember.delete({
      where: {
        roomMember: {
          userId,
          roomId,
        },
      },
    });
  }
  async updateReady(roomId: number, userId: number): Promise<MultiRoomMember> {
    return this.prisma.multiRoomMember.update({
      where: {
        roomMember: {
          userId,
          roomId,
        },
      },
      data: {
        isReady: true,
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

  async findReadyUser(roomId: number): Promise<MultiRoomMember[]> {
    return this.prisma.multiRoomMember.findMany({
      where: {
        AND: [{ roomId }, { isReady: true }],
      },
    });
  }

  async deleteNotReadyUser(roomId: number) {
    return this.prisma.multiRoomMember.deleteMany({
      where: {
        AND: [{ roomId }, { isReady: false }],
      },
    });
  }
}
