import { Injectable, Logger } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CompanyRequestDto } from './dto/company-request.dto'
import { StrapiSyncService } from '../strapi-sync/strapi-sync.service'

@Injectable()
export class EntrepriseService {
  private readonly logger = new Logger(EntrepriseService.name)

  constructor(
    private readonly supabase: SupabaseService,
    private readonly strapiSync: StrapiSyncService,
  ) {}

  async createCompanyRequest(companyRequestDto: CompanyRequestDto) {
    this.logger.log(`Nouvelle demande entreprise reçue de ${companyRequestDto.email}`)
    this.logger.log(`Entreprise: ${companyRequestDto.company}`)

    try {
      // Sauvegarder la demande en base de données
      const { data, error } = await this.supabase.getClient()
        .from('company_requests')
        .insert({
          contact_person: companyRequestDto.contactPerson,
          email: companyRequestDto.email,
          phone: companyRequestDto.phone,
          company: companyRequestDto.company,
          company_size: companyRequestDto.companySize,
          sector: companyRequestDto.sector,
          position: companyRequestDto.position || null,
          location: companyRequestDto.location || null,
          urgency: companyRequestDto.urgency,
          message: companyRequestDto.message,
          status: 'new',
          crm_sync_status: 'pending',
        })
        .select()
        .single()

      if (error) {
        this.logger.error(`Erreur lors de la sauvegarde de la demande: ${error.message}`)
        this.logger.error(`Détails de l'erreur:`, JSON.stringify(error, null, 2))
        throw new Error(`Erreur lors de la sauvegarde de la demande: ${error.message}`)
      }

      this.logger.log(`Demande entreprise sauvegardée avec succès (ID: ${data.id})`)

      // Synchroniser vers le CRM en arrière-plan
      this.syncToCrm(data.id).catch((syncError) => {
        this.logger.error(`Erreur lors de la synchronisation CRM pour la demande ${data.id}:`, syncError)
      })

      return {
        success: true,
        message: 'Votre demande a été envoyée avec succès. Nous vous contacterons dans les plus brefs délais.',
        requestId: data.id,
      }
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création de la demande entreprise:`, error)
      throw error
    }
  }

  private async syncToCrm(requestId: string) {
    try {
      this.logger.log(`Synchronisation de la demande ${requestId} vers le CRM...`)

      // Récupérer la demande depuis la base
      const { data: request, error: fetchError } = await this.supabase.getClient()
        .from('company_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (fetchError || !request) {
        throw new Error(`Demande ${requestId} non trouvée`)
      }

      // Préparer les données pour le CRM (format similaire aux candidatures)
      const crmData = {
        firstName: request.contact_person.split(' ')[0] || request.contact_person,
        lastName: request.contact_person.split(' ').slice(1).join(' ') || '',
        email: request.email,
        phone: request.phone,
        company: request.company,
        jobTitle: request.position || 'Demande entreprise',
        source: 'company_request',
        // Ajouter des champs supplémentaires pour le CRM
        customFields: {
          companySize: request.company_size,
          sector: request.sector,
          location: request.location,
          urgency: request.urgency,
          message: request.message,
        },
      }

      // Synchroniser vers Strapi (ou autre CRM)
      await this.strapiSync.syncCompanyRequestToCrm(crmData)

      // Mettre à jour le statut de synchronisation
      await this.supabase.getClient()
        .from('company_requests')
        .update({
          crm_sync_status: 'synced',
          crm_sync_date: new Date().toISOString(),
        })
        .eq('id', requestId)

      this.logger.log(`✅ Demande ${requestId} synchronisée vers le CRM avec succès`)
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de la synchronisation CRM:`, error)

      // Mettre à jour le statut en cas d'erreur
      await this.supabase.getClient()
        .from('company_requests')
        .update({
          crm_sync_status: 'failed',
          crm_sync_error: error.message || 'Erreur inconnue',
        })
        .eq('id', requestId)

      throw error
    }
  }
}








