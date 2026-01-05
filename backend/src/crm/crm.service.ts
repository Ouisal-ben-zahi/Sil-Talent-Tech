import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Candidate, CvHistory, CrmSyncStatus } from '../common/types/database.types';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);
  private readonly crmApiUrl: string;
  private readonly crmApiKey: string;
  private readonly maxRetries = 3;

  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.crmApiUrl = this.configService.get<string>('CRM_API_URL', '');
    this.crmApiKey = this.configService.get<string>('CRM_API_KEY', '');
  }

  async syncCandidateToCrm(candidate: Candidate, cvHistory: CvHistory): Promise<void> {
    if (!this.crmApiUrl || !this.crmApiKey) {
      this.logger.warn('Configuration CRM manquante, synchronisation ignorée');
      return;
    }

    // Récupérer tous les CV du candidat pour les envoyer au CRM
    const allCvHistories = await this.supabase.findCvHistoryByCandidateId(candidate.id);
    const cvUrls = allCvHistories.map(cv => ({
      url: this.generateSecureCvUrl(cv.fileName),
      fileName: cv.fileName,
      uploadedAt: cv.uploadedAt.toISOString(),
      isLatest: cv.id === cvHistory.id, // Marquer le CV le plus récent
    }));

    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < this.maxRetries) {
      try {
        const payload = {
          // Informations candidat
          id_interne: candidate.id,
          nom: candidate.lastName,
          prenom: candidate.firstName,
          email: candidate.email,
          telephone: candidate.phone,
          linkedin: candidate.linkedin || null,
          portfolio: candidate.portfolio || null,
          jobTitle: candidate.jobTitle || null,
          expertiseLevel: candidate.expertiseLevel || null,
          country: candidate.country || null,
          city: candidate.city || null,
          source: candidate.source,
          
          // CV - Le plus récent en premier
          cv_url: this.generateSecureCvUrl(cvHistory.fileName), // CV principal (le plus récent)
          cv_file_name: cvHistory.fileName,
          cv_uploaded_at: cvHistory.uploadedAt.toISOString(),
          
          // Tous les CV du candidat (pour historique)
          cvs: cvUrls,
          
          // Métadonnées
          date: new Date().toISOString(),
          candidate_created_at: candidate.createdAt.toISOString(),
        };

        const response = await firstValueFrom(
          this.httpService.post(
            `${this.crmApiUrl}/api/candidates`,
            payload,
            {
              headers: {
                'Authorization': `Bearer ${this.crmApiKey}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );

        // Succès
        await this.supabase.updateCvHistory(cvHistory.id, {
          crmSyncStatus: CrmSyncStatus.SYNCED,
          crmSyncDate: new Date(),
          crmSyncRetryCount: retryCount,
        });

        this.logger.log(`Candidat ${candidate.id} synchronisé avec succès au CRM (${allCvHistories.length} CV(s))`);
        return;
      } catch (error) {
        lastError = error;
        retryCount++;
        this.logger.warn(
          `Tentative ${retryCount}/${this.maxRetries} échouée pour le candidat ${candidate.id}`,
        );

        if (retryCount < this.maxRetries) {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    }

    // Échec après toutes les tentatives
    await this.supabase.updateCvHistory(cvHistory.id, {
      crmSyncStatus: CrmSyncStatus.FAILED,
      crmSyncError: lastError?.message || 'Erreur inconnue',
      crmSyncRetryCount: retryCount,
    });

    this.logger.error(
      `Échec de la synchronisation CRM pour le candidat ${candidate.id} après ${retryCount} tentatives`,
    );

    // Alerter si 3 échecs consécutifs
    if (retryCount >= this.maxRetries) {
      this.logger.error('ALERTE: 3 échecs consécutifs de synchronisation CRM');
    }
  }

  async retrySync(cvHistoryId: string): Promise<void> {
    const cvHistory = await this.supabase.findCvHistoryById(cvHistoryId);

    if (!cvHistory) {
      throw new Error('Historique CV non trouvé');
    }

    // Récupérer le candidat avec tous ses CV
    const candidate = await this.supabase.findCandidateById(cvHistory.candidateId);
    if (!candidate) {
      throw new Error('Candidat non trouvé');
    }

    // Synchroniser avec le CV spécifique (mais envoyer tous les CV du candidat)
    await this.syncCandidateToCrm(candidate, cvHistory);
  }

  /**
   * Synchroniser tous les CV d'un candidat vers le CRM
   * Utile pour synchroniser un candidat existant avec tous ses CV
   */
  async syncAllCandidateCvsToCrm(candidateId: string): Promise<void> {
    const candidate = await this.supabase.findCandidateById(candidateId);
    if (!candidate) {
      throw new Error('Candidat non trouvé');
    }

    const cvHistories = await this.supabase.findCvHistoryByCandidateId(candidateId);
    if (cvHistories.length === 0) {
      this.logger.warn(`Aucun CV trouvé pour le candidat ${candidateId}`);
      return;
    }

    // Synchroniser avec le CV le plus récent
    const latestCv = cvHistories.sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    )[0];

    this.logger.log(`Synchronisation de ${cvHistories.length} CV(s) pour le candidat ${candidateId}`);
    await this.syncCandidateToCrm(candidate, latestCv);
  }

  private generateSecureCvUrl(fileName: string): string {
    // Générer une URL sécurisée pour télécharger le CV
    const baseUrl = this.configService.get<string>('API_BASE_URL', 'http://localhost:3001');
    return `${baseUrl}/api/admin/cvs/${fileName}/download`;
  }
}
