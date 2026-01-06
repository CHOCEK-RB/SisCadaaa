import { IsEmail, IsNotEmpty } from 'class-validator';

export class PreRegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
