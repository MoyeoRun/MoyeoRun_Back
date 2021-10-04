import { IsEmail, IsInt, IsString, IsUUID } from 'class-validator';

export class AuthResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}

export class DeserializeAccessToken {
  @IsInt()
  id: number;

  @IsEmail()
  email: string;
}

export class DeserializeRefreshToken {
  @IsInt()
  id: number;

  @IsEmail()
  email: string;

  @IsUUID()
  tokenId: string;
}
