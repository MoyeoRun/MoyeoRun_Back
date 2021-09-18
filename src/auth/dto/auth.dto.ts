import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class AuthResponse {
  @IsOptional()
  @IsString()
  accessToken: string;
}

export class DeserializeAccessToken {
  @IsInt()
  id: number;

  @IsEmail()
  email: string;
}
