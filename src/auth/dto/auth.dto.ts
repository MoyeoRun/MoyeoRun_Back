import { IsEmail, IsInt, IsString, IsUUID } from 'class-validator';

export class AuthResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}

export class SerializeAccessToken {
  @IsInt()
  id: number;

  @IsEmail()
  email: string;
}

export class SerializeRefreshToken {
  @IsInt()
  id: number;

  @IsEmail()
  email: string;

  @IsUUID()
  tokenId: string;
}
