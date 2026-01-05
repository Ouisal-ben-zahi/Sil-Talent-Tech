import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto, ChatResponseDto } from './dto/chat-message.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() chatDto: ChatMessageDto): Promise<ChatResponseDto> {
    try {
      const response = await this.chatbotService.generateResponse(chatDto);
      
      // Vérification multiple que la réponse n'est pas vide
      if (!response) {
        return {
          response: 'Je n\'ai pas pu générer de réponse pour votre question. Pourriez-vous reformuler ou nous contacter directement à contact@sil-talents-tech.com ?',
          conversationId: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sources: [],
        };
      }
      
      if (!response.response || typeof response.response !== 'string' || response.response.trim().length === 0) {
        return {
          response: 'Je n\'ai pas pu générer de réponse pour votre question. Pourriez-vous reformuler ou nous contacter directement à contact@sil-talents-tech.com ?',
          conversationId: response?.conversationId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sources: response?.sources || [],
        };
      }
      
      // S'assurer que la réponse est bien une string non vide
      const finalResponse = response.response.trim();
      
      // Log pour déboguer
      console.log('Réponse du service:', {
        length: finalResponse.length,
        preview: finalResponse.substring(0, 100),
        hasResponse: !!response.response,
        responseType: typeof response.response,
      });
      
      if (finalResponse.length === 0) {
        console.warn('Réponse vide détectée dans le contrôleur');
        return {
          response: 'Sil Talents Tech est un cabinet de recrutement spécialisé en technologies. Pour plus d\'informations, contactez-nous à contact@sil-talents-tech.com.',
          conversationId: response?.conversationId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sources: response?.sources || [],
        };
      }
      
      return {
        ...response,
        response: finalResponse,
      };
    } catch (error: any) {
      // En cas d'erreur, retourner une réponse par défaut plutôt que de lancer une exception
      const errorMessage = error?.message || 'Une erreur est survenue';
      const safeResponse = errorMessage.trim().length > 0 
        ? errorMessage 
        : 'Je n\'ai pas pu générer de réponse pour votre question. Pourriez-vous reformuler ou nous contacter directement à contact@sil-talents-tech.com ?';
      
      return {
        response: safeResponse,
        conversationId: chatDto.conversationId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sources: [],
      };
    }
  }
}

