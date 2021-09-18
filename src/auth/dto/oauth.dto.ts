import { IsBoolean, IsEmail, IsString } from 'class-validator';

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
  @IsString()
  accessToken: string;

  @IsBoolean()
  isNewUser: boolean;
}
