import { Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/common/repositories/user.repository';
import { UpdateUserRequest, UpdateUserResponse } from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  updateProfile(
    user: Prisma.UserWhereUniqueInput,
    updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userRepository.updateOne(
      {
        email: user.email,
      },
      updateUserRequest,
    );
  }
}
