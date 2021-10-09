import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserRequest {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

export class UpdateUserRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class UserResponse {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;
}
