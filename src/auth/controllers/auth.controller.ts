import { Controller, Post, UseGuards } from '@nestjs/common';
import { RefreshPayload } from '../decorators/auth.decorator';
import { SerializeRefreshToken } from '../dto/auth.dto';
import { JwtRefreshAuthGuard } from '../guards/refresh-jwt-auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshAccessToken(
    @RefreshPayload() payload: SerializeRefreshToken,
  ): Promise<any> {
    await this.authService.deleteRefreshToken(payload.tokenId);
    return this.authService.login(payload);
  }
}
