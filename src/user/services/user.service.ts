import { User } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { SerializeAccessToken } from 'src/auth/dto/auth.dto';
import { UpdateUserRequest, UpdateUserResponse } from '../dto/user.dto';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async updateProfile(
    user: SerializeAccessToken,
    updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userRepository.updateByEmail(
      { id: user.id },
      updateUserRequest,
    );
  }

  async findByEmail(user: SerializeAccessToken): Promise<User> {
    return this.userRepository.findByEmail(user);
  }
}
