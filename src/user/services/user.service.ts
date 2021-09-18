import { Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { UpdateUserRequest, UpdateUserResponse } from '../dto/user.dto';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  updateProfile(
    user: DeserializeAccessToken,
    updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userRepository.updateByEmail(user, updateUserRequest);
  }
}
