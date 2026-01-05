import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { UpdateCandidatureStatusDto } from './dto/update-candidature-status.dto';
import { Candidature, CandidatureStatus, CrmSyncStatus } from '../common/types/database.types';
import { CrmService } from '../crm/crm.service';

@Injectable()
export class CandidaturesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly crmService: CrmService,
  ) {}

  async create(candidateId: string, createCandidatureDto: CreateCandidatureDto): Promise<Candidature> {
    // Vérifier si la catégorie existe
    const categorie = await this.supabase.findCategorieById(createCandidatureDto.categorieId);
    if (!categorie) {
      throw new NotFoundException(`Categorie with ID "${createCandidatureDto.categorieId}" not found`);
    }

    // Vérifier si le candidat existe
    const candidate = await this.supabase.findCandidateById(candidateId);
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID "${candidateId}" not found`);
    }

    // Vérifier si le candidat n'a pas déjà postulé pour cette catégorie
    const existingCandidatures = await this.supabase.findCandidaturesByCandidate(candidateId);
    const alreadyApplied = existingCandidatures.some(
      c => c.categorieId === createCandidatureDto.categorieId
    );
    if (alreadyApplied) {
      throw new BadRequestException('Vous avez déjà postulé pour cette catégorie');
    }

    // Créer la candidature
    const candidature = await this.supabase.createCandidature({
      candidateId,
      categorieId: createCandidatureDto.categorieId,
      cvPath: createCandidatureDto.cvPath,
      typeDeMission: createCandidatureDto.typeDeMission || null,
      statut: createCandidatureDto.statut || CandidatureStatus.EN_ATTENTE,
      sentToCrm: false,
      crmSyncStatus: CrmSyncStatus.PENDING,
    });

    // Tenter de synchroniser avec le CRM (en arrière-plan)
    this.syncCandidatureToCrm(candidature, candidate, categorie).catch((error) => {
      console.error(`Erreur lors de la synchronisation CRM pour la candidature ${candidature.id}:`, error);
    });

    return candidature;
  }

  async findCandidaturesByCandidate(candidateId: string): Promise<Candidature[]> {
    return this.supabase.findCandidaturesByCandidate(candidateId);
  }

  async findCandidaturesByCategorie(categorieId: string): Promise<Candidature[]> {
    return this.supabase.findCandidaturesByCategorie(categorieId);
  }

  async findOne(id: string): Promise<Candidature> {
    const candidature = await this.supabase.findCandidatureById(id);
    if (!candidature) {
      throw new NotFoundException(`Candidature with ID "${id}" not found`);
    }
    return candidature;
  }

  async updateStatus(id: string, updateStatusDto: UpdateCandidatureStatusDto): Promise<Candidature> {
    await this.findOne(id); // Check if exists
    return this.supabase.updateCandidatureStatus(id, updateStatusDto.statut);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.supabase.deleteCandidature(id);
  }

  private async syncCandidatureToCrm(
    candidature: Candidature,
    candidate: any,
    categorie: any,
  ): Promise<void> {
    try {
      // Logique de synchronisation CRM (à adapter selon vos besoins)
      // Pour l'instant, on marque simplement comme synced
      await this.supabase.updateCandidatureCrmSync(candidature.id, {
        sentToCrm: true,
        crmSyncStatus: CrmSyncStatus.SYNCED,
        crmSyncDate: new Date(),
      });
    } catch (error) {
      await this.supabase.updateCandidatureCrmSync(candidature.id, {
        sentToCrm: false,
        crmSyncStatus: CrmSyncStatus.FAILED,
        crmSyncError: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

