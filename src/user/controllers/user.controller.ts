import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { UpdateUserRequest, UpdateUserResponse } from '../dto/user.dto';
import { UserService } from '../services/user.service';
import { UserForAuth } from '../vo/user.vo';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async update(
    @User() user: UserForAuth,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userService.updateProfile(user, updateUserRequest);
  }
}
