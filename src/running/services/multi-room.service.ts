import { MultiRoom } from '.prisma/client';
import { HttpException, Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { GlobalCacheService } from 'src/cache/global.cache.service';
import { subTimeByMillisecond } from 'src/common/utils/day.util';
import { MultiRoomWithMember } from 'src/repository/prisma.type';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { SocketGateway } from 'src/socket/socket.gateway';
import { JobsService } from '../../jobs/jobs.service';
import { MultiRoomMemberRepository } from '../../repository/multi-room-member.repository';
import { MultiRoomRepository } from '../../repository/multi-room.repository';
import { MultiRoomCreateRequest } from '../dto/multi-room.dto';
import { RunningRepository } from '../repositories/running.repository';

@Injectable()
export class MultiRoomService {
  constructor(
    private jobsService: JobsService,
    private socketGateway: SocketGateway,
    private multiRoomRepository: MultiRoomRepository,
    private roomStatusRepository: RoomStatusRepository,
    private multiRoomMemberRepository: MultiRoomMemberRepository,
    private runningRepository: RunningRepository,
    private globalCacheService: GlobalCacheService,
  ) {}

  async createMultiRoom(
    body: MultiRoomCreateRequest,
    user: DeserializeAccessToken,
  ): Promise<MultiRoom> {
    const participatedRoom = await this.roomStatusRepository.findByUserId(
      user.id,
    );
    if (participatedRoom.length > 0) {
      throw new HttpException('이미 방에 참여중입니다', 400);
    }
    const multiRoom = await this.multiRoomRepository.create({
      ...body,
      status: 'Open',
      multiRoomMember: {
        create: {
          userId: user.id,
          isOwner: true,
        },
      },
    });

    //소켓 연결
    this.socketGateway.server
      .in(this.socketGateway.socketId)
      .socketsJoin(multiRoom.id.toString());

    console.log(this.socketGateway.socketId);
    await this.roomStatusRepository.create({
      roomId: multiRoom.id,
      userId: user.id,
      socketId: this.socketGateway.socketId,
    });

    // Job 등록
    const result = await this.jobsService.addJobMultiRunBroadCast(
      multiRoom.id,
      body.startDate,
    );
    const delay = subTimeByMillisecond(multiRoom.startDate) + 100000;
    await this.globalCacheService.createCache(
      `room-${multiRoom.id}`,
      `bull:multiRun:${result.id}`,
      {
        ttl: delay,
      },
    );
    return multiRoom;
  }

  async join(user: DeserializeAccessToken, roomId: string): Promise<string> {
    const participatedRoom = await this.roomStatusRepository.findByUserId(
      user.id,
    );

    if (participatedRoom.length > 0) {
      throw new HttpException('이미 방에 참여중입니다', 400);
    }
    const findMultiRun = await this.multiRoomRepository.findById(
      parseInt(roomId),
    );
    if (!findMultiRun) throw new HttpException('존재하지 않는 방입니다', 400);
    if (findMultiRun.multiRoomMember.length == findMultiRun.limitMember) {
      throw new HttpException('방 인원이 꽉 찼습니다', 400);
    }
    // 시작 10초 이전에 참석하려고 한 경우
    if (subTimeByMillisecond(new Date(findMultiRun.startDate)) < 10000) {
      throw new HttpException('참여하실 수 없습니다', 400);
    }
    await this.multiRoomMemberRepository.create({
      roomId: findMultiRun.id,
      userId: user.id,
    });
    //소켓 연결
    this.socketGateway.server
      .in(this.socketGateway.socketId)
      .socketsJoin(findMultiRun.id.toString());

    await this.roomStatusRepository.create({
      roomId: findMultiRun.id,
      userId: user.id,
      socketId: this.socketGateway.socketId,
    });
    return '방 참여 성공';
  }

  async leave(user: DeserializeAccessToken, roomId: string): Promise<string> {
    const participatedRoom = await this.multiRoomMemberRepository.findByUserId(
      user.id,
    );

    if (!participatedRoom[0]) {
      throw new HttpException('방에 참여하고 있지 않습니다.', 400);
    }
    const findMultiRun = await this.multiRoomRepository.findById(
      parseInt(roomId),
    );

    if (!findMultiRun) throw new HttpException('존재하지 않는 방입니다', 400);

    const checkOwner = await this.multiRoomMemberRepository.findOwner(user.id);
    if (checkOwner[0])
      throw new HttpException('본인이 소유한 방은 떠나기 불가능합니다', 403);

    await this.multiRoomMemberRepository.delete(findMultiRun.id, user.id);
    await this.roomStatusRepository.deleteByUserId(user.id);
    this.socketGateway.server
      .in(this.socketGateway.socketId)
      .socketsLeave(findMultiRun.id.toString());
    return '방 떠나기 성공';
  }

  async deleteMultiRoom(user: DeserializeAccessToken, roomId: string) {
    console.log(roomId);

    const findMultiRun = await this.multiRoomRepository.findById(
      parseInt(roomId),
    );

    if (!findMultiRun) throw new HttpException('존재하지 않는 방입니다', 400);

    const isOwner = await this.multiRoomMemberRepository.findOwner(user.id);
    if (!isOwner[0])
      throw new HttpException('방을 삭제할 권한이 없습니다', 403);

    await this.multiRoomRepository.delete(findMultiRun.id);
    const getJob = await this.globalCacheService.getCache(`room-${roomId}`);
    await this.globalCacheService.deleteCache(getJob);
    await this.globalCacheService.deleteCache(`room-${roomId}`);
    await this.roomStatusRepository.deleteByRoomId(findMultiRun.id);
    return '방 삭제 성공';
  }

  async findMultiRoom(
    user: DeserializeAccessToken,
    roomId: string,
  ): Promise<MultiRoom> {
    const findMultiRun: MultiRoomWithMember =
      await this.multiRoomRepository.findById(parseInt(roomId));

    if (!findMultiRun) throw new HttpException('존재하지 않는 방입니다', 400);
    return findMultiRun;
  }
}
