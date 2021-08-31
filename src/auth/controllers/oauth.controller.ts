import { Controller, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/user/decorators/user.decorator';
import { OauthResponse, OauthUserRequest } from '../dto/oauth.dto';
import { KakaoOauthGuard } from '../guards/kakao-oauth.guard';
import { OauthService } from '../services/oauth.service';

@Controller('oauth')
export class OauthController {
  constructor(private oauthService: OauthService) {}

  @UseGuards(KakaoOauthGuard)
  @Post('kakao')
  async kakao(@User() user: OauthUserRequest): Promise<OauthResponse> {
    return this.oauthService.authentication(user);
  }
}
