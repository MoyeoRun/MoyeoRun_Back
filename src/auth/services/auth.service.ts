import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserForAuth } from '../../user/vo/user.vo';
import { AuthResponse } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: UserForAuth): AuthResponse {
    return {
      accessToken: this.jwtService.sign(user),
    };
  }
}
