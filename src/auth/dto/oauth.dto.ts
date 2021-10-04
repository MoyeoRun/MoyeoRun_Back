import { IsBoolean, IsEmail, IsString } from 'class-validator';
import { AuthResponse } from './auth.dto';

export class OauthRequest {
  @IsString()
  accessToken: string;
}

export class OauthUserRequest {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

export class OauthResponse {
  token: AuthResponse;

  @IsBoolean()
  isNewUser: boolean;
}
