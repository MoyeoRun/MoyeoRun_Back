import { MultiRoom } from '.prisma/client';
import { HttpException, Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { GlobalCacheService } from 'src/cache/global.cache.service';
import { subTime } from 'src/common/utils/day.util';
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
    let multiRoom;
    try {
      multiRoom = await this.multiRoomRepository.create({
        ...body,
        status: 'Open',
        multiRoomMember: {
          create: {
            userId: user.id,
            isOwner: true,
          },
        },
      });
      await this.roomStatusRepository.create({
        roomId: multiRoom.id,
        userId: user.id,
        socketId: this.socketGateway.socketId,
      });
      //소켓 연결
      this.socketGateway.server
        .in(this.socketGateway.socketId)
        .socketsJoin(multiRoom.id.toString());
    } catch (err) {
      console.error(err);
      throw new HttpException('방 생성 실패', 400);
    }

    // Job 등록
    const autoStartJob = await this.jobsService.addJobMultiRunBroadCastStart(
      multiRoom.id,
      body.startDate,
    );
    const autoStartJobCacheTtl =
      subTime(new Date(multiRoom.startDate), new Date()) + 50;
    await this.globalCacheService.setCache(
      `roomJob:${multiRoom.id}`,
      `bull:multiRun:${autoStartJob.id}`,
      {
        ttl: autoStartJobCacheTtl,
      },
    );
    const prepareJob = await this.jobsService.prepareMultiRunBroadCast(
      multiRoom.id,
      body.startDate,
    );
    const prepareJobCacheTtl =
      subTime(new Date(multiRoom.startDate), new Date()) + 50;
    await this.globalCacheService.setCache(
      `roomNotiJob:${multiRoom.id}`,
      `bull:multiRun:${prepareJob.id}`,
      {
        ttl: prepareJobCacheTtl,
      },
    );
    return multiRoom;
  }

  async join(user: DeserializeAccessToken, roomId: string): Promise<any> {
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
    if (!(findMultiRun.status == 'Open')) {
      throw new HttpException('Open 방이 아닙니다', 400);
    }

    try {
      await this.multiRoomMemberRepository.create({
        roomId: findMultiRun.id,
        userId: user.id,
      });

      await this.roomStatusRepository.create({
        roomId: findMultiRun.id,
        userId: user.id,
        socketId: this.socketGateway.socketId,
      });
      //소켓 연결
      this.socketGateway.server
        .in(this.socketGateway.socketId)
        .socketsJoin(findMultiRun.id.toString());
    } catch (err) {
      console.error(err);
      throw new HttpException('참가 실패', 400);
    }

    return { success: true };
  }

  async leave(user: DeserializeAccessToken, roomId: string): Promise<any> {
    const participatedRoom =
      await this.multiRoomMemberRepository.findByUserIdAndRoomId(
        Number(roomId),
        user.id,
      );

    if (!participatedRoom[0]) {
      throw new HttpException('방에 참여하고 있지 않습니다.', 400);
    }
    const findMultiRun = await this.multiRoomRepository.findById(
      parseInt(roomId),
    );

    if (!findMultiRun) throw new HttpException('존재하지 않는 방입니다', 400);

    const checkOwner = await this.multiRoomMemberRepository.findOwner(
      Number(roomId),
      user.id,
    );
    if (checkOwner[0])
      throw new HttpException('본인이 소유한 방은 떠나기 불가능합니다', 400);

    try {
      await this.multiRoomMemberRepository.delete(findMultiRun.id, user.id);
      await this.roomStatusRepository.deleteByUserId(user.id);
      this.socketGateway.server
        .in(this.socketGateway.socketId)
        .socketsLeave(findMultiRun.id.toString());
    } catch (err) {
      console.error(err);
      throw new HttpException('방 떠나기 실패', 400);
    }

    return { success: true };
  }

  async deleteMultiRoom(user: DeserializeAccessToken, roomId: string) {
    const findMultiRun = await this.multiRoomRepository.findById(
      parseInt(roomId),
    );

    if (!findMultiRun) throw new HttpException('존재하지 않는 방입니다', 400);

    const isOwner = await this.multiRoomMemberRepository.findOwner(
      Number(roomId),
      user.id,
    );
    if (!isOwner[0])
      throw new HttpException('방을 삭제할 권한이 없습니다', 400);
    try {
      await this.multiRoomRepository.delete(findMultiRun.id);
      await this.roomStatusRepository.deleteByRoomId(findMultiRun.id);
    } catch (err) {
      console.error(err);
      throw new HttpException('방 삭제 실패', 400);
    }

    const getJob = await this.globalCacheService.getCache(`roomJob:${roomId}`);
    if (getJob) await this.globalCacheService.deleteCache(getJob);
    await this.globalCacheService.deleteCache(`roomJob:${roomId}`);

    const getPrepareJob = await this.globalCacheService.getCache(
      `roomNotiJob:${roomId}`,
    );
    if (getPrepareJob) await this.globalCacheService.deleteCache(getPrepareJob);
    await this.globalCacheService.deleteCache(`roomNotiJob:${roomId}`);

    return { success: true };
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

  async findMultiRoomList(user: DeserializeAccessToken): Promise<any> {
    const currentParticipatedRoom =
      await this.roomStatusRepository.findByUserId(user.id);
    let currentRoom = [],
      openRoomList = [];
    if (currentParticipatedRoom.length > 0) {
      console.log(currentParticipatedRoom);
      currentRoom = await this.multiRoomRepository.findOpenRoomById(
        currentParticipatedRoom[0].roomId,
      );
      console.log(currentRoom);
      openRoomList = await this.multiRoomRepository.findOpenRoomListWithoutId(
        currentRoom[0].id,
      );
    } else openRoomList = await this.multiRoomRepository.findOpenRoom();

    return {
      currentRoom,
      openRoomList,
    };
  }
}
