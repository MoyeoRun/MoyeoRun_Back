import { IsEmail, IsString } from 'class-validator';

export class CreateUserRequest {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
