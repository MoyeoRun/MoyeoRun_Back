import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class UserResponse {
  @IsString()
  id: number;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  nickName: string;
}

export class UserNiceNameResponse {
  @IsString()
  nickName: string;

  @IsBoolean()
  isUnique: boolean;
}
