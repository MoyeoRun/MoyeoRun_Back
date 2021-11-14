import { Controller, Post, UseGuards } from '@nestjs/common';
import { RefreshPayload } from '../decorators/auth.decorator';
import { AuthResponse, DeserializeRefreshToken } from '../dto/auth.dto';
import { JwtRefreshAuthGuard } from '../guards/refresh-jwt-auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshAccessToken(
    @RefreshPayload() payload: DeserializeRefreshToken,
  ): Promise<AuthResponse> {
    await this.authService.deleteRefreshToken(payload.tokenId);
    return this.authService.login(payload);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout')
  async logout(
    @RefreshPayload() payload: DeserializeRefreshToken,
  ): Promise<any> {
    await this.authService.deleteRefreshToken(payload.tokenId);
    return { message: 'Logout 성공' };
  }
}
