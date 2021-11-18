import { MultiRoom, MultiRoomMember, Prisma } from '.prisma/client';
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

  async findOwner(roomId: number, userId: number): Promise<MultiRoomMember[]> {
    return this.prisma.multiRoomMember.findMany({
      where: {
        userId,
        isOwner: true,
        roomId,
      },
    });
  }

  async findByUserIdAndRoomId(
    roomId: number,
    userId: number,
  ): Promise<MultiRoomMember[]> {
    return this.prisma.multiRoomMember.findMany({
      where: {
        roomId,
        userId,
      },
    });
  }

  async findByUserIdWithMultiRoomBetweenTerm(
    userId: number,
    start: Date,
    end: Date,
  ): Promise<
    { multiRoom: MultiRoom & { multiRoomMember: MultiRoomMember[] } }[]
  > {
    return this.prisma.multiRoomMember.findMany({
      where: {
        userId,
        multiRoom: {
          startDate: {
            gte: start,
            lte: end,
          },
        },
      },
      select: {
        multiRoom: {
          include: {
            multiRoomMember: {
              where: { userId },
            },
          },
        },
      },
    });
  }

  async findReadyUserByUserId(userId: number): Promise<MultiRoomMember[]> {
    return this.prisma.multiRoomMember.findMany({
      where: {
        AND: [{ userId }, { isReady: true }],
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

  async updateRunIdByUserIdAndRoomId(
    runId: string,
    roomId: number,
    userId: number,
  ) {
    return this.prisma.multiRoomMember.update({
      where: {
        roomMember: {
          userId,
          roomId,
        },
      },
      data: {
        runId,
      },
    });
  }

  async updateRankByUserId(roomId: number, userId: number, rank: number) {
    return this.prisma.multiRoomMember.update({
      where: {
        roomMember: {
          roomId,
          userId,
        },
      },
      data: { rank },
    });
  }
}
