import { HttpException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { UserService } from 'src/user/services/user.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from '../auth.repository';
import { AuthResponse, DeserializeAccessToken } from '../dto/auth.dto';

const BASE_OPTION: JwtSignOptions = {
  issuer: 'moyeorun.paas-ta.org',
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private userService: UserService,
  ) {}

  async generateAccessToken(user: DeserializeAccessToken): Promise<string> {
    const options: JwtSignOptions = {
      ...BASE_OPTION,
    };

    return this.jwtService.signAsync({ user }, options);
  }

  async generateRefreshToken(user: DeserializeAccessToken): Promise<string> {
    const tokenId = uuidv4();
    const options: JwtSignOptions = {
      ...BASE_OPTION,
      expiresIn: '30d',
      jwtid: tokenId,
    };

    const refreshToken = await this.jwtService.signAsync({ user }, options);
    await this.authRepository.createRefreshToken(
      tokenId,
      refreshToken,
      60 * 60 * 24 * 30,
    );

    return refreshToken;
  }

  async resolveAccessToken(token: string): Promise<void> {
    const payload = await this.decodeRefreshToken(token);

    if (!payload) {
      throw new HttpException('Access token malformed', 401);
    }

    const user: DeserializeAccessToken = payload.user;

    if (!user) {
      throw new HttpException('Access token malformed', 401);
    }
  }

  async resolveRefreshToken(payload: any): Promise<{
    user: DeserializeAccessToken;
    tokenId: string;
  }> {
    const tokenId = payload.jti;

    if (!payload) {
      throw new HttpException('Refresh token malformed', 401);
    }

    const refreshToken: string =
      await this.authRepository.getStoredRefreshToken(tokenId);

    if (!refreshToken) {
      throw new HttpException('Refresh token not found', 401);
    }

    const user: DeserializeAccessToken = payload.user;

    if (!user) {
      throw new HttpException('Refresh token malformed', 401);
    }

    return { user, tokenId };
  }

  async decodeRefreshToken(token: string): Promise<any> {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new HttpException('Refresh token expired', 403);
      } else {
        throw new HttpException('Refresh token malformed', 401);
      }
    }
  }

  async createAccessTokenFromRefreshToken(token: string): Promise<string> {
    const payload = await this.decodeRefreshToken(token);
    const { user } = await this.resolveRefreshToken(payload);
    const accessToken = await this.generateAccessToken(user);
    return accessToken;
  }

  async login(user: DeserializeAccessToken): Promise<AuthResponse> {
    const refreshToken = await this.generateRefreshToken(user);
    const accessToken = await this.generateAccessToken(user);

    return { accessToken, refreshToken };
  }

  async deleteRefreshToken(tokenId: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(tokenId);
  }
}
