import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Candidate, CvHistory, Admin, CandidateWithCvHistory, ApplicationSource, CrmSyncStatus, Categorie, Candidature, CandidatureStatus, PhotoHistory } from '../common/types/database.types';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    let url = supabaseUrl;
    // Utiliser SERVICE_ROLE_KEY en priorité pour le backend (bypass RLS)
    // Sinon utiliser ANON_KEY (limité par RLS)
    let key = supabaseServiceKey || supabaseAnonKey || '';

    // Si SUPABASE_URL n'est pas défini, extraire depuis DATABASE_URL
    if (!url && databaseUrl) {
      try {
        const dbUrl = new URL(databaseUrl.replace('postgresql://', 'https://'));
        url = `https://${dbUrl.hostname.replace('db.', '').replace('.supabase.co', '')}.supabase.co`;
      } catch (e) {
        throw new Error('Impossible d\'extraire l\'URL Supabase depuis DATABASE_URL');
      }
    }

    if (!url) {
      throw new Error('SUPABASE_URL ou DATABASE_URL doit être configuré dans .env');
    }

    if (!key) {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY n\'est pas défini. Certaines opérations pourraient échouer.');
    }

    // Utiliser SERVICE_ROLE_KEY pour le backend (recommandé pour bypass RLS)
    // En production, vous devriez toujours fournir SUPABASE_SERVICE_ROLE_KEY
    this.client = createClient(url, key);
    
    console.log('✅ Supabase client initialisé:', {
      url: url.substring(0, 30) + '...',
      hasKey: !!key,
      usingServiceRole: !!supabaseServiceKey,
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  // Candidates
  async findCandidateByEmail(email: string): Promise<Candidate | null> {
    console.log('🔍 SupabaseService.findCandidateByEmail - Recherche avec email:', email);
    
    const { data, error } = await this.client
      .from('candidates')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('❌ SupabaseService.findCandidateByEmail - Erreur Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }
    
    if (!data) {
      console.log('⚠️ SupabaseService.findCandidateByEmail - Aucune donnée trouvée pour email:', email);
      return null;
    }
    
    console.log('✅ SupabaseService.findCandidateByEmail - Candidat trouvé:', {
      id: data.id,
      email: data.email,
      hasPassword: !!data.password_hash,
    });
    
    return this.mapCandidate(data);
  }

  async findCandidateById(id: string): Promise<Candidate | null> {
    console.log('🔍 SupabaseService.findCandidateById - Recherche avec ID:', id);
    console.log('🔍 SupabaseService.findCandidateById - Type de ID:', typeof id);
    
    const { data, error } = await this.client
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ SupabaseService.findCandidateById - Erreur Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }
    
    if (!data) {
      console.log('⚠️ SupabaseService.findCandidateById - Aucune donnée trouvée pour ID:', id);
      return null;
    }
    
    console.log('✅ SupabaseService.findCandidateById - Candidat trouvé:', {
      id: data.id,
      email: data.email,
    });
    
    return this.mapCandidate(data);
  }

  async findCandidateWithCvHistory(id: string): Promise<CandidateWithCvHistory | null> {
    console.log('🔍 SupabaseService.findCandidateWithCvHistory - id:', id);
    
    // Spécifier explicitement la relation pour éviter l'ambiguïté
    const { data, error } = await this.client
      .from('candidates')
      .select(`
        *,
        cv_history!cv_history_candidate_id_fkey (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ SupabaseService.findCandidateWithCvHistory - Erreur Supabase:', error);
      return null;
    }
    
    if (!data) {
      console.log('⚠️ SupabaseService.findCandidateWithCvHistory - Aucune donnée trouvée');
      return null;
    }
    
    console.log('✅ SupabaseService.findCandidateWithCvHistory - Données trouvées:', {
      id: data.id,
      email: data.email,
      cvHistoryCount: data.cv_history?.length || 0,
    });
    
    const candidate = this.mapCandidate(data);
    const cvHistories = (data.cv_history || []).map((cv: any) => this.mapCvHistory(cv));
    
    return {
      ...candidate,
      cvHistories,
    };
  }

  async createCandidate(candidateData: Partial<Candidate>): Promise<Candidate> {
    const insertData: any = {
      first_name: candidateData.firstName,
      last_name: candidateData.lastName,
      email: candidateData.email,
      phone: candidateData.phone,
      password_hash: candidateData.passwordHash,
      linkedin: candidateData.linkedin,
      portfolio: candidateData.portfolio,
      job_title: candidateData.jobTitle,
      expertise_level: candidateData.expertiseLevel,
      country: candidateData.country,
      city: candidateData.city,
      source: candidateData.source,
      is_active: candidateData.isActive ?? true,
    };

    // Ajouter les nouveaux champs (toujours, même si null ou undefined)
    insertData.type_de_mission_souhaite = candidateData.typeDeMissionSouhaite || null;
    insertData.categorie_principale_id = candidateData.categoriePrincipaleId || null;

    console.log('📝 Données à insérer dans Supabase:', {
      email: insertData.email,
      type_de_mission_souhaite: insertData.type_de_mission_souhaite,
      categorie_principale_id: insertData.categorie_principale_id,
      typeDeMissionSouhaite_from_data: candidateData.typeDeMissionSouhaite,
      categoriePrincipaleId_from_data: candidateData.categoriePrincipaleId,
    });

    console.log('📝 Tentative de création de candidat:', {
      email: insertData.email,
      firstName: insertData.first_name,
      lastName: insertData.last_name,
    });

    const { data, error } = await this.client
      .from('candidates')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur Supabase lors de la création du candidat:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`Erreur lors de la création du candidat: ${error.message}${error.details ? ' - ' + error.details : ''}`);
    }

    console.log('✅ Candidat créé avec succès:', {
      id: data.id,
      email: data.email,
    });

    return this.mapCandidate(data);
  }

  async updateCandidate(id: string, candidateData: Partial<Candidate>): Promise<Candidate> {
    const updateData: any = {};
    if (candidateData.firstName !== undefined) updateData.first_name = candidateData.firstName;
    if (candidateData.lastName !== undefined) updateData.last_name = candidateData.lastName;
    if (candidateData.phone !== undefined) updateData.phone = candidateData.phone;
    if (candidateData.linkedin !== undefined) updateData.linkedin = candidateData.linkedin;
    if (candidateData.portfolio !== undefined) updateData.portfolio = candidateData.portfolio;
    if (candidateData.jobTitle !== undefined) updateData.job_title = candidateData.jobTitle;
    if (candidateData.expertiseLevel !== undefined) updateData.expertise_level = candidateData.expertiseLevel;
    if (candidateData.country !== undefined) updateData.country = candidateData.country;
    if (candidateData.city !== undefined) updateData.city = candidateData.city;
    if (candidateData.typeDeMissionSouhaite !== undefined) updateData.type_de_mission_souhaite = candidateData.typeDeMissionSouhaite;
    if (candidateData.categoriePrincipaleId !== undefined) updateData.categorie_principale_id = candidateData.categoriePrincipaleId;
    if (candidateData.nationality !== undefined) updateData.nationality = candidateData.nationality;
    if (candidateData.dateOfBirth !== undefined) updateData.date_of_birth = candidateData.dateOfBirth;
    if (candidateData.gender !== undefined) updateData.gender = candidateData.gender;
    if (candidateData.maritalStatus !== undefined) updateData.marital_status = candidateData.maritalStatus;
    if (candidateData.educationLevel !== undefined) updateData.education_level = candidateData.educationLevel;
    if (candidateData.professionalExperience !== undefined) updateData.professional_experience = candidateData.professionalExperience;
    if (candidateData.biography !== undefined) updateData.biography = candidateData.biography;

    // Si aucun champ à mettre à jour, retourner le candidat tel quel
    if (Object.keys(updateData).length === 0) {
      const candidate = await this.findCandidateById(id);
      if (!candidate) {
        throw new Error(`Candidat avec l'ID ${id} non trouvé`);
      }
      return candidate;
    }

    const { data, error } = await this.client
      .from('candidates')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw new Error(`Erreur lors de la mise à jour du candidat: ${error.message}`);
    if (!data) throw new Error(`Candidat avec l'ID ${id} non trouvé après la mise à jour`);
    return this.mapCandidate(data);
  }

  async deleteCandidate(id: string): Promise<void> {
    const { error } = await this.client
      .from('candidates')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erreur lors de la suppression du candidat: ${error.message}`);
  }

  async findCandidates(
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
    }
  ) {
    let query = this.client
      .from('candidates')
      .select(`
        *,
        cv_history!cv_history_candidate_id_fkey (*)
      `, { count: 'exact' });

    if (search) {
      const searchPattern = `%${search}%`;
      query = query.or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern}`);
    }

    // Appliquer les filtres avancés
    if (filters) {
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.country) {
        query = query.ilike('country', `%${filters.country}%`);
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.expertiseLevel) {
        query = query.eq('expertise_level', filters.expertiseLevel);
      }
    }

    // Si on filtre par hasCv, on doit d'abord récupérer tous les candidats pour filtrer
    // puis appliquer la pagination manuellement
    if (filters?.hasCv !== undefined) {
      const { data: allData, error: allError } = await query
        .order('created_at', { ascending: false });

      if (allError) throw new Error(`Erreur lors de la récupération des candidats: ${allError.message}`);

      let allCandidates = (allData || []).map((item: any) => ({
        ...this.mapCandidate(item),
        cvHistories: (item.cv_history || []).map((cv: any) => this.mapCvHistory(cv)),
      }));

      // Filtrer par présence de CV
      if (filters.hasCv) {
        allCandidates = allCandidates.filter(c => c.cvHistories && c.cvHistories.length > 0);
      } else {
        allCandidates = allCandidates.filter(c => !c.cvHistories || c.cvHistories.length === 0);
      }

      const total = allCandidates.length;
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedCandidates = allCandidates.slice(from, to);

      return {
        data: paginatedCandidates,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Sinon, pagination normale
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Erreur lors de la récupération des candidats: ${error.message}`);

    const candidates = (data || []).map((item: any) => ({
      ...this.mapCandidate(item),
      cvHistories: (item.cv_history || []).map((cv: any) => this.mapCvHistory(cv)),
    }));

    return {
      data: candidates,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async countCandidates(): Promise<number> {
    const { count, error } = await this.client
      .from('candidates')
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(`Erreur lors du comptage des candidats: ${error.message}`);
    return count || 0;
  }

  // CV History
  async createCvHistory(cvData: Partial<CvHistory>): Promise<CvHistory> {
    const { data, error } = await this.client
      .from('cv_history')
      .insert({
        candidate_id: cvData.candidateId,
        file_name: cvData.fileName,
        file_path: cvData.filePath,
        file_size: cvData.fileSize,
        crm_sync_status: cvData.crmSyncStatus,
      })
      .select()
      .single();

    if (error) throw new Error(`Erreur lors de la création de l'historique CV: ${error.message}`);
    return this.mapCvHistory(data);
  }

  async findCvHistoryByCandidateId(candidateId: string): Promise<CvHistory[]> {
    const { data, error } = await this.client
      .from('cv_history')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('uploaded_at', { ascending: false });

    if (error) throw new Error(`Erreur lors de la récupération de l'historique CV: ${error.message}`);
    return (data || []).map((item: any) => this.mapCvHistory(item));
  }

  async findCvHistoryById(id: string): Promise<CvHistory | null> {
    const { data, error } = await this.client
      .from('cv_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapCvHistory(data);
  }

  async deleteCvHistory(id: string): Promise<void> {
    const { error } = await this.client
      .from('cv_history')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de l'historique CV: ${error.message}`);
    }
  }

  async updateCvHistory(id: string, cvData: Partial<CvHistory>): Promise<CvHistory> {
    const updateData: any = {};
    if (cvData.crmSyncStatus !== undefined) updateData.crm_sync_status = cvData.crmSyncStatus;
    if (cvData.crmSyncDate !== undefined) updateData.crm_sync_date = cvData.crmSyncDate;
    if (cvData.crmSyncError !== undefined) updateData.crm_sync_error = cvData.crmSyncError;
    if (cvData.crmSyncRetryCount !== undefined) updateData.crm_sync_retry_count = cvData.crmSyncRetryCount;

    const { data, error } = await this.client
      .from('cv_history')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erreur lors de la mise à jour de l'historique CV: ${error.message}`);
    return this.mapCvHistory(data);
  }

  async countCvHistory(where?: { crmSyncStatus?: string }): Promise<number> {
    try {
    let query = this.client
      .from('cv_history')
      .select('*', { count: 'exact', head: true });

    if (where?.crmSyncStatus) {
      query = query.eq('crm_sync_status', where.crmSyncStatus);
    }

    const { count, error } = await query;

      if (error) {
        console.error('❌ Erreur countCvHistory:', error);
        throw new Error(`Erreur lors du comptage de l'historique CV: ${error.message}`);
      }
    return count || 0;
    } catch (error: any) {
      console.error('❌ Exception dans countCvHistory:', error);
      throw new Error(`Erreur lors du comptage de l'historique CV: ${error.message || error}`);
    }
  }

  // Admins
  async findAdminByEmail(email: string): Promise<Admin | null> {
    const { data, error } = await this.client
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return this.mapAdmin(data);
  }

  async findAdminById(id: string): Promise<Admin | null> {
    const { data, error } = await this.client
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapAdmin(data);
  }

  async createAdmin(adminData: Partial<Admin>): Promise<Admin> {
    const { data, error } = await this.client
      .from('admins')
      .insert({
        email: adminData.email,
        password_hash: adminData.passwordHash,
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        role: adminData.role,
        is_active: adminData.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(`Erreur lors de la création de l'admin: ${error.message}`);
    return this.mapAdmin(data);
  }


  async findLatestCvByCandidateId(candidateId: string): Promise<CvHistory | null> {
    const { data, error } = await this.client
      .from('cv_history')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Erreur lors de la récupération du CV: ${error.message}`);
    }

    return data ? this.mapCvHistory(data) : null;
  }

  // Photo History
  async createPhotoHistory(photoData: Partial<PhotoHistory>): Promise<PhotoHistory> {
    const { data, error } = await this.client
      .from('photo_history')
      .insert({
        candidate_id: photoData.candidateId,
        file_name: photoData.fileName,
        file_path: photoData.filePath,
        file_size: photoData.fileSize,
      })
      .select()
      .single();

    if (error) throw new Error(`Erreur lors de la création de l'historique photo: ${error.message}`);
    return this.mapPhotoHistory(data);
  }

  async findPhotoHistoryByCandidateId(candidateId: string): Promise<PhotoHistory[]> {
    const { data, error } = await this.client
      .from('photo_history')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('uploaded_at', { ascending: false });

    if (error) throw new Error(`Erreur lors de la récupération de l'historique photo: ${error.message}`);
    return (data || []).map((item: any) => this.mapPhotoHistory(item));
  }

  async findPhotoHistoryById(id: string): Promise<PhotoHistory | null> {
    const { data, error } = await this.client
      .from('photo_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapPhotoHistory(data);
  }

  async findLatestPhotoByCandidateId(candidateId: string): Promise<PhotoHistory | null> {
    const { data, error } = await this.client
      .from('photo_history')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Erreur lors de la récupération de la photo: ${error.message}`);
    }

    return data ? this.mapPhotoHistory(data) : null;
  }

  async deletePhotoHistory(id: string): Promise<void> {
    const { error } = await this.client
      .from('photo_history')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erreur lors de la suppression de l'historique photo: ${error.message}`);
  }

  // Mappers
  private mapCandidate(data: any): Candidate {
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      passwordHash: data.password_hash,
      linkedin: data.linkedin,
      portfolio: data.portfolio,
      jobTitle: data.job_title,
      expertiseLevel: data.expertise_level,
      country: data.country,
      city: data.city,
      typeDeMissionSouhaite: data.type_de_mission_souhaite || null,
      categoriePrincipaleId: data.categorie_principale_id || null,
      nationality: data.nationality || null,
      dateOfBirth: data.date_of_birth || data.dateOfBirth || null,
      gender: data.gender || null,
      maritalStatus: data.marital_status || data.maritalStatus || null,
      educationLevel: data.education_level || data.educationLevel || null,
      professionalExperience: data.professional_experience || data.professionalExperience || null,
      biography: data.biography || null,
      source: data.source,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapCvHistory(data: any): CvHistory {
    return {
      id: data.id,
      candidateId: data.candidate_id,
      fileName: data.file_name,
      filePath: data.file_path,
      fileSize: typeof data.file_size === 'string' ? BigInt(data.file_size) : data.file_size,
      crmSyncStatus: data.crm_sync_status,
      crmSyncDate: data.crm_sync_date ? new Date(data.crm_sync_date) : null,
      crmSyncError: data.crm_sync_error,
      crmSyncRetryCount: data.crm_sync_retry_count,
      uploadedAt: new Date(data.uploaded_at),
    };
  }

  private mapPhotoHistory(data: any): PhotoHistory {
    return {
      id: data.id,
      candidateId: data.candidate_id,
      fileName: data.file_name,
      filePath: data.file_path,
      fileSize: typeof data.file_size === 'string' ? BigInt(data.file_size) : data.file_size,
      uploadedAt: new Date(data.uploaded_at),
    };
  }

  private mapAdmin(data: any): Admin {
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Categories
  async createCategorie(data: Partial<Categorie>): Promise<Categorie> {
    const { data: newCategorie, error } = await this.client
      .from('categories')
      .insert({
        nom: data.nom,
        description: data.description || null,
      })
      .select()
      .single();
    if (error) throw new Error(`Error creating categorie: ${error.message}`);
    return this.mapCategorie(newCategorie);
  }

  async findCategories(): Promise<Categorie[]> {
    try {
      console.log('🔍 SupabaseService.findCategories - Début de la requête');
      const { data, error } = await this.client
        .from('categories')
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) {
        console.error('❌ SupabaseService.findCategories - Erreur Supabase:', error);
        throw new Error(`Error fetching categories: ${error.message} (code: ${error.code})`);
      }
      
      console.log(`✅ SupabaseService.findCategories - ${data?.length || 0} catégorie(s) trouvée(s)`);
      return (data || []).map(item => this.mapCategorie(item));
    } catch (error: any) {
      console.error('❌ SupabaseService.findCategories - Exception:', error);
      throw error;
    }
  }

  async findCategorieById(id: string): Promise<Categorie | null> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(`Error fetching categorie: ${error.message}`);
    return data ? this.mapCategorie(data) : null;
  }

  async updateCategorie(id: string, data: Partial<Categorie>): Promise<Categorie> {
    const { data: updatedCategorie, error } = await this.client
      .from('categories')
      .update({
        nom: data.nom,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Error updating categorie: ${error.message}`);
    return this.mapCategorie(updatedCategorie);
  }

  async deleteCategorie(id: string): Promise<void> {
    const { error } = await this.client.from('categories').delete().eq('id', id);
    if (error) throw new Error(`Error deleting categorie: ${error.message}`);
  }

  // Candidatures
  async createCandidature(data: Partial<Candidature>): Promise<Candidature> {
    const { data: newCandidature, error } = await this.client
      .from('candidatures')
      .insert({
        candidate_id: data.candidateId,
        categorie_id: data.categorieId,
        cv_path: data.cvPath,
        type_de_mission: data.typeDeMission || null,
        date_postulation: data.datePostulation || new Date().toISOString(),
        statut: data.statut || CandidatureStatus.EN_ATTENTE,
        sent_to_crm: data.sentToCrm || false,
        crm_sync_status: data.crmSyncStatus || CrmSyncStatus.PENDING,
      })
      .select()
      .single();
    if (error) throw new Error(`Error creating candidature: ${error.message}`);
    return this.mapCandidature(newCandidature);
  }

  async findCandidaturesByCandidate(candidateId: string): Promise<Candidature[]> {
    const { data, error } = await this.client
      .from('candidatures')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('date_postulation', { ascending: false });
    if (error) throw new Error(`Error fetching candidatures for candidate ${candidateId}: ${error.message}`);
    return (data || []).map(item => this.mapCandidature(item));
  }

  async findAllCandidaturesWithSource(): Promise<Array<Candidature & { candidateSource: string; candidateGender: string | null }>> {
    const { data, error } = await this.client
      .from('candidatures')
      .select(`
        *,
        candidates!candidatures_candidate_id_fkey (
          source,
          gender
        )
      `)
      .order('date_postulation', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération des candidatures:', error);
      throw new Error(`Error fetching candidatures with source: ${error.message}`);
    }

    console.log('📊 Candidatures récupérées depuis Supabase:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('📅 Première candidature:', {
        id: data[0].id,
        date_postulation: data[0].date_postulation,
        candidate_id: data[0].candidate_id,
        candidate_source: data[0].candidates?.source,
        candidate_gender: data[0].candidates?.gender,
        type_de_mission: data[0].type_de_mission
      });
    }

    return (data || []).map((item: any) => {
      const candidature = this.mapCandidature(item);
      return {
        ...candidature,
        // Garder datePostulation comme Date (mapCandidature le fait déjà)
        candidateSource: item.candidates?.source || 'unknown',
        candidateGender: item.candidates?.gender || null,
      };
    });
  }

  async getDistinctFilterValues(): Promise<{
    sources: string[];
    genders: string[];
    educationLevels: string[];
  }> {
    try {
      console.log('🔍 Récupération des valeurs distinctes pour les filtres...');
      
      // Récupérer toutes les valeurs de source (même null pour voir ce qu'on obtient)
      const { data: sourcesData, error: sourcesError } = await this.client
        .from('candidates')
        .select('source');

      // Récupérer toutes les valeurs de gender
      const { data: gendersData, error: gendersError } = await this.client
        .from('candidates')
        .select('gender');

      // Récupérer toutes les valeurs de education_level
      const { data: educationData, error: educationError } = await this.client
        .from('candidates')
        .select('education_level');

      if (sourcesError) {
        console.error('❌ Erreur lors de la récupération des sources:', sourcesError);
      } else {
        console.log('✅ Sources récupérées:', sourcesData?.length || 0, 'lignes');
      }
      
      if (gendersError) {
        console.error('❌ Erreur lors de la récupération des genres:', gendersError);
      } else {
        console.log('✅ Genres récupérés:', gendersData?.length || 0, 'lignes');
      }
      
      if (educationError) {
        console.error('❌ Erreur lors de la récupération des niveaux d\'éducation:', educationError);
      } else {
        console.log('✅ Niveaux d\'éducation récupérés:', educationData?.length || 0, 'lignes');
      }

      // Extraire les valeurs uniques et filtrer les valeurs null/undefined/vides
      const sources = Array.from(
        new Set(
          (sourcesData || [])
            .map((item: any) => item?.source)
            .filter((v: any) => v !== null && v !== undefined && v !== '')
        )
      ) as string[];
      
      const genders = Array.from(
        new Set(
          (gendersData || [])
            .map((item: any) => item?.gender)
            .filter((v: any) => v !== null && v !== undefined && v !== '')
        )
      ) as string[];
      
      const educationLevels = Array.from(
        new Set(
          (educationData || [])
            .map((item: any) => item?.education_level)
            .filter((v: any) => v !== null && v !== undefined && v !== '')
        )
      ) as string[];

      console.log('📊 Valeurs distinctes extraites:', {
        sources: sources.length,
        genders: genders.length,
        educationLevels: educationLevels.length,
      });
      console.log('📋 Détails:', {
        sources: sources,
        genders: genders,
        educationLevels: educationLevels,
      });

      return {
        sources: sources.sort(),
        genders: genders.sort(),
        educationLevels: educationLevels.sort(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des valeurs distinctes:', error);
      return {
        sources: [],
        genders: [],
        educationLevels: [],
      };
    }
  }

  async findCandidaturesByCategorie(categorieId: string): Promise<Candidature[]> {
    const { data, error } = await this.client
      .from('candidatures')
      .select('*')
      .eq('categorie_id', categorieId)
      .order('date_postulation', { ascending: false });
    if (error) throw new Error(`Error fetching candidatures for categorie ${categorieId}: ${error.message}`);
    return (data || []).map(item => this.mapCandidature(item));
  }

  async findCandidatureById(id: string): Promise<Candidature | null> {
    const { data, error } = await this.client
      .from('candidatures')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(`Error fetching candidature: ${error.message}`);
    return data ? this.mapCandidature(data) : null;
  }

  async updateCandidatureStatus(id: string, statut: CandidatureStatus): Promise<Candidature> {
    const { data, error } = await this.client
      .from('candidatures')
      .update({
        statut,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Error updating candidature status: ${error.message}`);
    return this.mapCandidature(data);
  }

  async updateCandidatureCrmSync(id: string, crmData: {
    sentToCrm: boolean;
    crmSyncStatus: CrmSyncStatus;
    crmSyncDate?: Date;
    crmSyncError?: string;
  }): Promise<Candidature> {
    const { data, error } = await this.client
      .from('candidatures')
      .update({
        sent_to_crm: crmData.sentToCrm,
        crm_sync_status: crmData.crmSyncStatus,
        crm_sync_date: crmData.crmSyncDate ? crmData.crmSyncDate.toISOString() : null,
        crm_sync_error: crmData.crmSyncError || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Error updating candidature CRM sync: ${error.message}`);
    return this.mapCandidature(data);
  }

  async deleteCandidature(id: string): Promise<void> {
    const { error } = await this.client.from('candidatures').delete().eq('id', id);
    if (error) throw new Error(`Error deleting candidature: ${error.message}`);
  }

  // Mappers
  private mapCategorie(data: any): Categorie {
    try {
      return {
        id: data.id,
        nom: data.nom,
        description: data.description,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('❌ Erreur lors du mapping de la catégorie:', error, 'Data:', data);
      throw new Error(`Error mapping categorie: ${error.message}`);
    }
  }

  private mapCandidature(data: any): Candidature {
    return {
      id: data.id,
      candidateId: data.candidate_id,
      categorieId: data.categorie_id,
      cvPath: data.cv_path,
      typeDeMission: data.type_de_mission || null,
      datePostulation: new Date(data.date_postulation),
      statut: data.statut,
      sentToCrm: data.sent_to_crm,
      crmSyncStatus: data.crm_sync_status,
      crmSyncDate: data.crm_sync_date ? new Date(data.crm_sync_date) : null,
      crmSyncError: data.crm_sync_error,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

}

