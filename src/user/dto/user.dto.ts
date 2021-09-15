import { IsNumber, IsString } from 'class-validator';

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
