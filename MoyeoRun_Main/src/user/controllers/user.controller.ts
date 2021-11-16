import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/decorators/auth.decorator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/access-jwt-auth.guard';
import {
  UpdateUserRequest,
  UserNiceNameResponse,
  UserResponse,
} from '../dto/user.dto';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Patch('/')
  async update(
    @User() user: DeserializeAccessToken,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<UserResponse> {
    return this.userService.updateProfile(user, updateUserRequest);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('/')
  async getUserInfo(
    @User() user: DeserializeAccessToken,
  ): Promise<UserResponse> {
    return this.userService.findByEmail(user);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('/:nickName')
  async checkNickName(
    @User() user: DeserializeAccessToken,
    @Param('nickName') nickName: string,
  ): Promise<UserNiceNameResponse> {
    return this.userService.findByNickName(nickName);
  }
}
