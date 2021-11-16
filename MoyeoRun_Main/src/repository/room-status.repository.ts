import { Prisma, RoomStatus } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomStatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.RoomStatusCreateInput): Promise<RoomStatus> {
    return this.prisma.roomStatus.create({
      data,
    });
  }

  async findByUserId(userId: number): Promise<RoomStatus[]> {
    return this.prisma.roomStatus.findMany({
      where: {
        userId,
      },
    });
  }

  async findBySocketId(socketId: string): Promise<RoomStatus[]> {
    return this.prisma.roomStatus.findMany({
      where: {
        socketId,
      },
    });
  }

  async updateSocketIdByUserId(
    userId: number,
    socketId: string,
  ): Promise<RoomStatus> {
    return this.prisma.roomStatus.update({
      where: {
        userId,
      },
      data: {
        socketId,
      },
    });
  }

  async deleteByUserId(userId: number) {
    return this.prisma.roomStatus.delete({
      where: {
        userId,
      },
    });
  }

  async deleteByRoomId(roomId: number) {
    return this.prisma.roomStatus.deleteMany({
      where: {
        roomId,
      },
    });
  }
}
