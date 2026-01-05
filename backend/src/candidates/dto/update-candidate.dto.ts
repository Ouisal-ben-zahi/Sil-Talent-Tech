import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ExpertiseLevel } from '../../common/types/database.types';

export class UpdateCandidateDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

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
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  professionalExperience?: string;

  @IsOptional()
  @IsString()
  biography?: string;
}

