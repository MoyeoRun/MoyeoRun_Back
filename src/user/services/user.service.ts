import { Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { UpdateUserRequest, UserResponse } from '../dto/user.dto';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async updateProfile(
    user: DeserializeAccessToken,
    updateUserRequest: UpdateUserRequest,
  ): Promise<UserResponse> {
    return this.userRepository.updateByEmail(
      { id: user.id },
      updateUserRequest,
    );
  }

  async findByEmail(user: DeserializeAccessToken): Promise<UserResponse> {
    return this.userRepository.findByEmail({ email: user.email });
  }
}
