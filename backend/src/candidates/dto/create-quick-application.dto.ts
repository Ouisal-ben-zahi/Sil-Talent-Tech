import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApplicationSource } from '../../common/types/database.types';

export class CreateQuickApplicationDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  phone: string;

  @IsEnum(ApplicationSource)
  source: ApplicationSource;
}

