import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { UpdateUserRequest, UpdateUserResponse } from '../dto/user.dto';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async update(
    @User() user: DeserializeAccessToken,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userService.updateProfile(user, updateUserRequest);
  }
}
