import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ExpertiseLevel, ApplicationSource } from '../../common/types/database.types';

export class RegisterDto {
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

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsEnum(ExpertiseLevel)
  expertiseLevel?: ExpertiseLevel;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  typeDeMissionSouhaite?: string;

  @IsOptional()
  @IsString()
  categoriePrincipaleId?: string;

  @IsOptional()
  @IsEnum(ApplicationSource)
  source?: ApplicationSource;
}

