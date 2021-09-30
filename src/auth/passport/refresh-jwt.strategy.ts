import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from 'src/config/passport.config';
import { SerializeRefreshToken } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<SerializeRefreshToken> {
    const { user, tokenId } = await this.authService.resolveRefreshToken(
      payload,
    );

    const serializeRefreshToken: SerializeRefreshToken = {
      id: user.id,
      email: user.email,
      tokenId,
    };

    return serializeRefreshToken;
  }
}
