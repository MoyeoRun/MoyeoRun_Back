import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from 'src/config/passport.config';
import { UserModule } from 'src/user/user.module';
import { OauthController } from './controllers/oauth.controller';
import { GoogleStrategy } from './passport/google.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { KakaoStrategy } from './passport/kakao.strategy';
import { NaverStrategy } from './passport/naver.strategy';
import { AuthService } from './services/auth.service';
import { OauthService } from './services/oauth.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    OauthService,
    JwtStrategy,
    KakaoStrategy,
    NaverStrategy,
    GoogleStrategy,
  ],
  controllers: [OauthController],
})
export class AuthModule {}
