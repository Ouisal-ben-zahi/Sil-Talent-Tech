import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength } from 'class-validator'

export class CompanyRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  contactPerson: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  phone: string

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  company: string

  @IsString()
  @IsNotEmpty()
  companySize: string

  @IsString()
  @IsNotEmpty()
  sector: string

  @IsString()
  @IsOptional()
  position?: string

  @IsString()
  @IsOptional()
  location?: string

  @IsString()
  @IsNotEmpty()
  urgency: string

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string
}








