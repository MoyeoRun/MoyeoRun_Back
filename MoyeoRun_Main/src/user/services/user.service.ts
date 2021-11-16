import { Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { UserRepository } from '../../repository/user.repository';
import {
  UpdateUserRequest,
  UserNiceNameResponse,
  UserResponse,
} from '../dto/user.dto';

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
    return this.userRepository.findByUnique({ email: user.email });
  }

  async findByNickName(nickName: string): Promise<UserNiceNameResponse> {
    const user = await this.userRepository.findByUnique({ nickName });
    if (user) {
      return {
        isUnique: false,
        nickName,
      };
    } else {
      return {
        isUnique: true,
        nickName,
      };
    }
  }
}
