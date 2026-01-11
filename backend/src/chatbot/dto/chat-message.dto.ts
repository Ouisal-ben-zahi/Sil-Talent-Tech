import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  context?: string[];
}

export class ChatResponseDto {
  response: string;
  conversationId: string;
  sources?: Array<{
    type: string;
    title: string;
    content: string;
    relevance: number;
  }>;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}










