import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UploadService } from '../upload/upload.service';
import { CrmSyncStatus } from '../common/types/database.types';

@Injectable()
export class AdminService {
  constructor(
    private supabase: SupabaseService,
    private uploadService: UploadService,
  ) {}

  async findAllCandidates(
    page: number = 1,
    limit: number = 20,
    search?: string,
    filters?: {
      source?: string;
      country?: string;
      city?: string;
      gender?: string;
      expertiseLevel?: string;
      hasCv?: boolean;
    },
  ) {
    const result = await this.supabase.findCandidates(page, limit, search, filters);
    
    // Ajouter les URLs des photos de profil pour chaque candidat
    const candidatesWithPhotos = await Promise.all(
      result.data.map(async (candidate) => {
        try {
          const latestPhoto = await this.supabase.findLatestPhotoByCandidateId(candidate.id);
          if (latestPhoto) {
            const photoUrl = await this.uploadService.getPhotoPublicUrl(latestPhoto.fileName);
            return { ...candidate, profilePhotoUrl: photoUrl };
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération de la photo pour le candidat ${candidate.id}:`, error);
        }
        return { ...candidate, profilePhotoUrl: null };
      })
    );
    
    return {
      ...result,
      data: candidatesWithPhotos,
    };
  }

  async findOneCandidate(id: string) {
    const candidate = await this.supabase.findCandidateWithCvHistory(id);

    if (!candidate) {
      throw new NotFoundException('Candidat non trouvé');
    }

    return candidate;
  }

  async getStatistics() {
    const [
      totalCandidates,
      totalCvs,
      syncedCvs,
      failedSyncs,
      pendingSyncs,
    ] = await Promise.all([
      this.supabase.countCandidates(),
      this.supabase.countCvHistory(),
      this.supabase.countCvHistory({ crmSyncStatus: CrmSyncStatus.SYNCED }),
      this.supabase.countCvHistory({ crmSyncStatus: CrmSyncStatus.FAILED }),
      this.supabase.countCvHistory({ crmSyncStatus: CrmSyncStatus.PENDING }),
    ]);

    const successRate = totalCvs > 0 ? (syncedCvs / totalCvs) * 100 : 0;

    return {
      totalCandidates,
      totalCvs,
      syncedCvs,
      failedSyncs,
      pendingSyncs,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  async getAllCandidaturesWithSource() {
    return this.supabase.findAllCandidaturesWithSource();
  }

  async getContactMessagesCount(): Promise<number> {
    try {
      const { count, error } = await this.supabase.getClient()
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Erreur lors du comptage des messages de contact:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Erreur lors du comptage des messages de contact:', error);
      return 0;
    }
  }

  async getAllContactMessages(): Promise<Array<{ id: string; createdAt: string }>> {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('contact_messages')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des messages de contact:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des messages de contact:', error);
      return [];
    }
  }

  async getAllCompanyRequests(): Promise<Array<{
    id: string;
    contactPerson: string;
    email: string;
    phone: string;
    company: string;
    companySize: string;
    sector: string;
    position: string | null;
    location: string | null;
    urgency: string;
    message: string;
    status: string;
    createdAt: string;
  }>> {
    try {
      console.log('📧 Récupération des demandes entreprise depuis Supabase...');
      const { data, error } = await this.supabase.getClient()
        .from('company_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des demandes entreprise:', error);
        return [];
      }

      console.log(`✅ ${data?.length || 0} demandes entreprise récupérées depuis Supabase`);
      if (data && data.length > 0) {
        console.log('📋 Première demande:', {
          id: data[0].id,
          company: data[0].company,
          contactPerson: data[0].contact_person,
        });
      }

      return (data || []).map((req: any) => ({
        id: req.id,
        contactPerson: req.contact_person,
        email: req.email,
        phone: req.phone,
        company: req.company,
        companySize: req.company_size,
        sector: req.sector,
        position: req.position,
        location: req.location,
        urgency: req.urgency,
        message: req.message,
        status: req.status,
        createdAt: req.created_at,
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des demandes entreprise:', error);
      return [];
    }
  }

  async getFilterValues() {
    return this.supabase.getDistinctFilterValues();
  }

  async getAdvancedStatistics() {
    try {
      const client = this.supabase.getClient();
      
      // 1. Statistiques globales
      const totalCandidates = await this.supabase.countCandidates();
      
      // Nombre de catégories disponibles
      const { data: categories, error: categoriesError } = await client
        .from('categories')
        .select('id, nom', { count: 'exact' });
      
      const totalCategories = categories?.length || 0;
      
      // Candidatures par période
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - 7);
      thisWeek.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date(today);
      thisMonth.setMonth(today.getMonth() - 1);
      thisMonth.setHours(0, 0, 0, 0);
      
      // Récupérer toutes les candidatures
      const { data: candidatures, error: candidaturesError } = await client
        .from('candidatures')
        .select('date_postulation, statut, categorie_id, categories(nom)');
      
      console.log('📊 Candidatures récupérées depuis la base:', candidatures?.length || 0);
      
      if (candidaturesError) {
        console.error('❌ Erreur lors de la récupération des candidatures:', candidaturesError);
      }
      
      const candidaturesToday = candidatures?.filter(c => {
        if (!c.date_postulation) return false;
        const date = new Date(c.date_postulation);
        date.setHours(0, 0, 0, 0);
        return date.getTime() >= today.getTime();
      }).length || 0;
      
      const candidaturesThisWeek = candidatures?.filter(c => {
        if (!c.date_postulation) return false;
        const date = new Date(c.date_postulation);
        date.setHours(0, 0, 0, 0);
        return date.getTime() >= thisWeek.getTime();
      }).length || 0;
      
      const candidaturesThisMonth = candidatures?.filter(c => {
        if (!c.date_postulation) return false;
        const date = new Date(c.date_postulation);
        date.setHours(0, 0, 0, 0);
        return date.getTime() >= thisMonth.getTime();
      }).length || 0;
      
      console.log('📅 Candidatures par période:', {
        today: candidaturesToday,
        thisWeek: candidaturesThisWeek,
        thisMonth: candidaturesThisMonth,
        total: candidatures?.length || 0
      });
      
      // 2. Statistiques par catégorie
      const candidaturesByCategory: Record<string, number> = {};
      candidatures?.forEach((c: any) => {
        let categoryName = 'Non spécifié';
        if (c.categories) {
          if (Array.isArray(c.categories) && c.categories.length > 0) {
            categoryName = c.categories[0].nom || 'Non spécifié';
          } else if (c.categories.nom) {
            categoryName = c.categories.nom;
          }
        }
        candidaturesByCategory[categoryName] = (candidaturesByCategory[categoryName] || 0) + 1;
      });
      
      const categoryStats = Object.entries(candidaturesByCategory).map(([name, count]) => ({
        name,
        count,
        percentage: candidatures && candidatures.length > 0 
          ? Math.round((count / candidatures.length) * 100 * 100) / 100 
          : 0,
      }));
      
      // 3. Statistiques d'activité
      // Candidatures récentes (dernier jour / semaine)
      const recentCandidatures = candidatures?.filter(c => {
        const date = new Date(c.date_postulation);
        return date >= thisWeek;
      }) || [];
      
      // Candidatures par heure du jour - initialiser toutes les heures à 0
      const candidaturesByHour: Record<number, number> = {};
      for (let i = 0; i < 24; i++) {
        candidaturesByHour[i] = 0;
      }
      candidatures?.forEach(c => {
        if (c.date_postulation) {
          const date = new Date(c.date_postulation);
          const hour = date.getHours();
          candidaturesByHour[hour] = (candidaturesByHour[hour] || 0) + 1;
        }
      });
      
      // Nouveaux vs anciens candidats
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      
      const { data: allCandidates, error: candidatesError } = await client
        .from('candidates')
        .select('created_at');
      
      console.log('👥 Candidats récupérés:', allCandidates?.length || 0);
      
      const newCandidates = allCandidates?.filter(c => {
        if (!c.created_at) return false;
        const date = new Date(c.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime() >= sixMonthsAgo.getTime();
      }).length || 0;
      
      const oldCandidates = (allCandidates?.length || 0) - newCandidates;
      
      console.log('👥 Candidats nouveaux vs anciens:', {
        nouveaux: newCandidates,
        anciens: oldCandidates,
        total: allCandidates?.length || 0
      });
      
      // 4. Statistiques de suivi des candidatures
      const candidaturesByStatus: Record<string, number> = {};
      candidatures?.forEach(c => {
        const status = c.statut || 'en_attente';
        candidaturesByStatus[status] = (candidaturesByStatus[status] || 0) + 1;
      });
      
      const statusStats = Object.entries(candidaturesByStatus).map(([status, count]) => ({
        status,
        count,
        percentage: candidatures && candidatures.length > 0 
          ? Math.round((count / candidatures.length) * 100 * 100) / 100 
          : 0,
      }));
      
      // Temps moyen de traitement (simplifié - différence entre date_postulation et updated_at)
      let avgProcessingTime = 0;
      if (candidatures && candidatures.length > 0) {
        const { data: candidaturesWithDates } = await client
          .from('candidatures')
          .select('date_postulation, updated_at, statut')
          .in('statut', ['accepte', 'refuse']);
        
        if (candidaturesWithDates && candidaturesWithDates.length > 0) {
          const totalTime = candidaturesWithDates.reduce((acc, c) => {
            const postulationDate = new Date(c.date_postulation);
            const updatedDate = new Date(c.updated_at);
            const diffDays = (updatedDate.getTime() - postulationDate.getTime()) / (1000 * 60 * 60 * 24);
            return acc + diffDays;
          }, 0);
          avgProcessingTime = Math.round((totalTime / candidaturesWithDates.length) * 100) / 100;
        }
      }
      
      // 5. Statistiques par localisation
      const { data: candidatesWithLocation } = await client
        .from('candidates')
        .select('country, city');
      
      const candidaturesByLocation: Record<string, number> = {};
      candidatesWithLocation?.forEach(c => {
        const location = c.country || 'Non spécifié';
        candidaturesByLocation[location] = (candidaturesByLocation[location] || 0) + 1;
      });
      
      const result = {
        global: {
          totalCandidates,
          totalCategories,
          candidaturesByPeriod: {
            today: candidaturesToday,
            thisWeek: candidaturesThisWeek,
            thisMonth: candidaturesThisMonth,
          },
        },
        byCategory: categoryStats,
        activity: {
          recentCandidatures: recentCandidatures.length,
          candidaturesByHour: Object.entries(candidaturesByHour).map(([hour, count]) => ({
            hour: parseInt(hour),
            count,
          })).sort((a, b) => a.hour - b.hour),
          newVsOldCandidates: {
            new: newCandidates,
            old: oldCandidates,
          },
        },
        tracking: {
          byStatus: statusStats,
          avgProcessingTimeDays: avgProcessingTime,
        },
        location: Object.entries(candidaturesByLocation).map(([location, count]) => ({
          location,
          count,
        })),
      };
      
      console.log('📊 Statistiques calculées:', JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques avancées:', error);
      throw error;
    }
  }
}
