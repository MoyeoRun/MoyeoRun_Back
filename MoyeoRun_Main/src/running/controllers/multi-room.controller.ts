import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/auth.decorator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { JwtAccessAuthGuard } from '../../auth/guards/access-jwt-auth.guard';
import { MultiRoomCreateRequest } from '../dto/multi-room.dto';
import { MultiRoomService } from '../services/multi-room.service';

@Controller('multi')
export class MultiRoomController {
  constructor(private multiRoomService: MultiRoomService) {}

  @Post('')
  @UseGuards(JwtAccessAuthGuard)
  async createMultiRoom(
    @User() user: DeserializeAccessToken,
    @Body() body: MultiRoomCreateRequest,
  ) {
    return await this.multiRoomService.createMultiRoom(body, user);
  }

  @Post('/:roomId')
  @UseGuards(JwtAccessAuthGuard)
  async joinMultiRoom(
    @User() user: DeserializeAccessToken,
    @Param('roomId') roomId: string,
  ) {
    return this.multiRoomService.join(user, roomId);
  }

  @Patch('/:roomId')
  @UseGuards(JwtAccessAuthGuard)
  async leaveMultiRoom(
    @User() user: DeserializeAccessToken,
    @Param('roomId') roomId: string,
  ) {
    return this.multiRoomService.leave(user, roomId);
  }

  @Delete('/:roomId')
  @UseGuards(JwtAccessAuthGuard)
  async deleteMultiRoom(
    @User() user: DeserializeAccessToken,
    @Param('roomId') roomId: string,
  ) {
    return this.multiRoomService.deleteMultiRoom(user, roomId);
  }

  @Get('/list')
  @UseGuards(JwtAccessAuthGuard)
  async getListMultiRoom(@User() user: DeserializeAccessToken) {
    return this.multiRoomService.findMultiRoomList(user);
  }

  @Get('/:roomId')
  @UseGuards(JwtAccessAuthGuard)
  async getOneMultiRoom(
    @User() user: DeserializeAccessToken,
    @Param('roomId') roomId: string,
  ) {
    return this.multiRoomService.findMultiRoom(user, roomId);
  }
}
