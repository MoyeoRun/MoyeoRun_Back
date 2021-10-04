import { Controller, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/decorators/auth.decorator';
import { OauthResponse, OauthUserRequest } from '../dto/oauth.dto';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';
import { KakaoOauthGuard } from '../guards/kakao-oauth.guard';
import { NaverOauthGuard } from '../guards/naver-oauth.guard';
import { OauthService } from '../services/oauth.service';

@Controller('oauth')
export class OauthController {
  constructor(private oauthService: OauthService) {}

  @UseGuards(KakaoOauthGuard)
  @Post('kakao')
  async kakao(@User() user: OauthUserRequest): Promise<OauthResponse> {
    return this.oauthService.authentication(user);
  }

  @UseGuards(NaverOauthGuard)
  @Post('naver')
  async naver(@User() user: OauthUserRequest): Promise<OauthResponse> {
    return this.oauthService.authentication(user);
  }

  @UseGuards(GoogleOauthGuard)
  @Post('google')
  async google(@User() user: OauthUserRequest): Promise<OauthResponse> {
    return this.oauthService.authentication(user);
  }
}
