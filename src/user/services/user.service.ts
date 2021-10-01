import { User } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { UpdateUserRequest, UpdateUserResponse } from '../dto/user.dto';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async updateProfile(
    user: DeserializeAccessToken,
    updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userRepository.updateByEmail(
      { id: user.id },
      updateUserRequest,
    );
  }

  async findByEmail(user: DeserializeAccessToken): Promise<User> {
    return this.userRepository.findByEmail(user);
  }
}
