import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsEnum(['PDF', 'Guide', 'Template'])
  @IsOptional()
  type?: 'PDF' | 'Guide' | 'Template';
}


