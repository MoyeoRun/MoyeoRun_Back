import { CacheModule, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as redisStore from 'cache-manager-redis-store';
import { jwtConstants } from 'src/config/passport.config';
import { redisConstants } from 'src/config/redis.config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from 'src/user/services/user.service';
import { UserRepository } from 'src/user/user.repository';
import { AuthRepository } from './auth.repository';
import { AuthController } from './controllers/auth.controller';
import { OauthController } from './controllers/oauth.controller';
import { JwtAccessStrategy } from './passport/access-jwt.strategy';
import { GoogleStrategy } from './passport/google.strategy';
import { KakaoStrategy } from './passport/kakao.strategy';
import { NaverStrategy } from './passport/naver.strategy';
import { JwtRefreshStrategy } from './passport/refresh-jwt.strategy';
import { AuthService } from './services/auth.service';
import { OauthService } from './services/oauth.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: redisConstants.url,
      port: 6379,
    }),
    PrismaModule.import([UserRepository]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  providers: [
    AuthService,
    OauthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    UserService,
    KakaoStrategy,
    NaverStrategy,
    GoogleStrategy,
    AuthRepository,
  ],
  controllers: [OauthController, AuthController],
})
export class AuthModule {}
