import { MultiRoom } from '.prisma/client';
import { HttpException, Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { RoomStatusRepository } from 'src/repository/room-status.repository';
import { JobsService } from '../../jobs/jobs.service';
import { MultiRoomMemberRepository } from '../../repository/multi-room-member.repository';
import { MultiRoomRepository } from '../../repository/multi-room.repository';
import { MultiRoomCreateRequest } from '../dto/multi-room.dto';
import { RunningGateway } from '../running.gateway';

@Injectable()
export class MultiRoomService {
  constructor(
    private jobsService: JobsService,
    private runningGateway: RunningGateway,
    private multiRoomRepository: MultiRoomRepository,
    private roomStatusRepository: RoomStatusRepository,
    private multiRoomMemberRepository: MultiRoomMemberRepository,
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
    const multiRun = await this.multiRoomRepository.create({
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
    this.runningGateway.server
      .in(this.runningGateway.socketId)
      .socketsJoin(multiRun.id.toString());

    await this.roomStatusRepository.create({
      roomId: multiRun.id,
      userId: user.id,
      socketId: this.runningGateway.socketId,
    });
    return multiRun;
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

    await this.multiRoomMemberRepository.create({
      roomId: findMultiRun.id,
      userId: user.id,
    });
    //소켓 연결
    this.runningGateway.server
      .in(this.runningGateway.socketId)
      .socketsJoin(findMultiRun.id.toString());

    await this.roomStatusRepository.create({
      roomId: findMultiRun.id,
      userId: user.id,
      socketId: this.runningGateway.socketId,
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
    this.runningGateway.server
      .in(this.runningGateway.socketId)
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

    await this.roomStatusRepository.deleteByRoomId(findMultiRun.id);
    return '방 삭제 성공';
  }

  async findMultiRoom(
    user: DeserializeAccessToken,
    roomId: string,
  ): Promise<MultiRoom> {
    const findMultiRun = await this.multiRoomRepository.findById(
      parseInt(roomId),
    );

    if (!findMultiRun) throw new HttpException('존재하지 않는 방입니다', 400);
    return findMultiRun;
  }
}
