import { IsDate, IsEmail, IsInt, IsString, IsUUID } from 'class-validator';

export class Token {
  @IsString()
  token: string;

  @IsDate()
  expiresIn: Date;
}

export class AuthResponse {
  @IsString()
  accessToken = new Token();

  @IsString()
  refreshToken = new Token();
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
