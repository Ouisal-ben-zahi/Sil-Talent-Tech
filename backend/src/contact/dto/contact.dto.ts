import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class ContactDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @MinLength(5)
  subject: string;

  @IsString()
  @MinLength(10)
  message: string;
}





