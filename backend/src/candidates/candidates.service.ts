import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateQuickApplicationDto } from './dto/create-quick-application.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ApplicationSource, CrmSyncStatus } from '../common/types/database.types';

@Injectable()
export class CandidatesService {
  constructor(private supabase: SupabaseService) {}

  async createQuickApplication(
    dto: CreateQuickApplicationDto,
    cvPath: string,
    fileName: string,
    fileSize: number,
  ) {
    // Vérifier si un candidat existe déjà avec cet email
    let candidate = await this.supabase.findCandidateByEmail(dto.email);

    if (!candidate) {
      // Créer un nouveau candidat sans compte
      candidate = await this.supabase.createCandidate({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
        isActive: true,
      });
    }

    // Enregistrer l'historique du CV
    const cvHistory = await this.supabase.createCvHistory({
      candidateId: candidate.id,
      fileName,
      filePath: cvPath,
      fileSize,
      crmSyncStatus: CrmSyncStatus.PENDING,
    });

    return {
      candidate,
      cvHistory,
    };
  }

  async findOne(id: string) {
    console.log('🔍 CandidatesService.findOne - id:', id);
    
    if (!id) {
      throw new NotFoundException('ID candidat manquant');
    }
    
    const candidate = await this.supabase.findCandidateWithCvHistory(id);
    
    console.log('🔍 CandidatesService.findOne - candidate trouvé:', candidate ? 'Oui' : 'Non');

    if (!candidate) {
      throw new NotFoundException('Candidat non trouvé');
    }

    return candidate;
  }

  async update(id: string, updateDto: UpdateCandidateDto) {
    await this.findOne(id); // Vérifier que le candidat existe
    
    return this.supabase.updateCandidate(id, {
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      phone: updateDto.phone,
      linkedin: updateDto.linkedin,
      portfolio: updateDto.portfolio,
      jobTitle: updateDto.jobTitle,
      expertiseLevel: updateDto.expertiseLevel,
      country: updateDto.country,
      city: updateDto.city,
      typeDeMissionSouhaite: updateDto.typeDeMissionSouhaite,
      categoriePrincipaleId: updateDto.categoriePrincipaleId,
      nationality: updateDto.nationality,
      dateOfBirth: updateDto.dateOfBirth,
      gender: updateDto.gender,
      maritalStatus: updateDto.maritalStatus,
      educationLevel: updateDto.educationLevel,
      professionalExperience: updateDto.professionalExperience,
      biography: updateDto.biography,
    });
  }

  async getCvHistory(candidateId: string) {
    return this.supabase.findCvHistoryByCandidateId(candidateId);
  }

  async delete(id: string): Promise<void> {
    await this.supabase.deleteCandidate(id);
  }
}
