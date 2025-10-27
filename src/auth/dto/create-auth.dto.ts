import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
