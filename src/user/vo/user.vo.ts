import { IsEmail, IsInt, IsString } from 'class-validator';

export class UserForAuth {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
