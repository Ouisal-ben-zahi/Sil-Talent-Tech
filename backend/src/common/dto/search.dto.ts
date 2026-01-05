import { IsOptional, IsString, MinLength } from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;
}



