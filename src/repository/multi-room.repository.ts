import { MultiRoom, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MultiRoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MultiRoomCreateInput): Promise<MultiRoom> {
    return this.prisma.multiRoom.create({
      data,
      include: { multiRoomMember: true },
    });
  }

  async findById(id: number): Promise<MultiRoom> {
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
}