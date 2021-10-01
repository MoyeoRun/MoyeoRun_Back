import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/decorators/auth.decorator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/access-jwt-auth.guard';
import { UpdateUserRequest, UpdateUserResponse } from '../dto/user.dto';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Patch('/')
  async update(
    @User() user: DeserializeAccessToken,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userService.updateProfile(user, updateUserRequest);
  }
}
