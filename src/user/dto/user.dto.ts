import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateUserRequest {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

export class UpdateUserRequest {
  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;
}

export class UpdateUserResponse {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;
}
