import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateCategorieDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nom: string;

  @IsString()
  @IsOptional()
  description?: string;
}






