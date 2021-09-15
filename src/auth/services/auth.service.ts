import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse, DeserializeAccessToken } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: DeserializeAccessToken): AuthResponse {
    return {
      accessToken: this.jwtService.sign(user),
    };
  }
}
