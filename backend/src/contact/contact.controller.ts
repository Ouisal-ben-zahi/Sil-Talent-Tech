import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Candidate } from '../common/types/database.types';
import { CandidatesService } from '../candidates/candidates.service';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly candidatesService: CandidatesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sendContact(@Body() contactDto: ContactDto) {
    return await this.contactService.sendContactMessage(contactDto);
  }

  @Get('messages')
  @UseGuards(JwtAuthGuard)
  async getContactMessages(@CurrentUser() candidate: Candidate) {
    console.log('🔍 getContactMessages - candidate.id:', candidate.id);
    // Récupérer le profil complet du candidat pour obtenir son email
    const candidateProfile = await this.candidatesService.findOne(candidate.id);
    if (!candidateProfile || !candidateProfile.email) {
      console.error('❌ Email du candidat non trouvé pour:', candidate.id);
      throw new Error('Email du candidat non trouvé');
    }
    // Normaliser l'email (minuscules, trim)
    const normalizedEmail = candidateProfile.email.toLowerCase().trim();
    console.log('📧 Email du candidat trouvé (normalisé):', normalizedEmail);
    return await this.contactService.getContactMessagesByEmail(normalizedEmail);
  }
}





