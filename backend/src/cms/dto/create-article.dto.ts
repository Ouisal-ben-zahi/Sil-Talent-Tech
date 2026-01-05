import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsArray, IsUUID, IsNumber } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  tagIds?: string[];

  @IsEnum(['Draft', 'Published'])
  @IsOptional()
  status?: 'Draft' | 'Published';

  @IsUUID()
  @IsOptional()
  authorId?: string;

  // SEO
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaKeywords?: string;

  // Métadonnées
  @IsNumber()
  @IsOptional()
  views?: number;

  @IsNumber()
  @IsOptional()
  readingTime?: number;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @IsDateString()
  @IsOptional()
  scheduledAt?: Date;
}


