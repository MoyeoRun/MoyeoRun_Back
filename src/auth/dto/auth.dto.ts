import { IsOptional, IsString } from 'class-validator';

export class AuthResponse {
  @IsOptional()
  @IsString()
  accessToken: string;
}
