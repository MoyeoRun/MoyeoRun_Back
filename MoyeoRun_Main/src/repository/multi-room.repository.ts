import { MultiRoom, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MultiRoomWithMember } from './prisma.type';

@Injectable()
export class MultiRoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.MultiRoomCreateInput,
  ): Promise<MultiRoomWithMember> {
    return this.prisma.multiRoom.create({
      data,
      include: { multiRoomMember: true },
    });
  }

  async findById(id: number): Promise<MultiRoomWithMember> {
    return this.prisma.multiRoom.findUnique({
      where: {
        id,
      },
      include: { multiRoomMember: true },
    });
  }

  async delete(id: number): Promise<MultiRoom> {
    return this.prisma.multiRoom.delete({
      where: { id },
    });
  }

  async updateClose(id: number): Promise<MultiRoom> {
    return this.prisma.multiRoom.update({
      where: { id },
      data: {
        status: 'Close',
      },
    });
  }

  async findOpenRoom(id: number): Promise<MultiRoom[]> {
    return this.prisma.multiRoom.findMany({
      where: {
        id,
        status: 'Open',
      },
    });
  }

  async findOpenRoomList(id: number | null): Promise<MultiRoom[]> {
    return this.prisma.multiRoom.findMany({
      where: {
        status: 'Open',
        NOT: {
          id,
        },
      },
    });
  }
}
