import { Injectable, Logger } from '@nestjs/common';
import { ContactDto } from './dto/contact.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async sendContactMessage(contactDto: ContactDto) {
    // Log du message de contact
    this.logger.log(`Nouveau message de contact reçu de ${contactDto.email}`);
    this.logger.log(`Sujet: ${contactDto.subject}`);

    try {
      // Sauvegarder le message en base de données
      const { data, error } = await this.supabase.getClient()
        .from('contact_messages')
        .insert({
          name: contactDto.name,
          email: contactDto.email,
          phone: contactDto.phone || null,
          company: contactDto.company || null,
          subject: contactDto.subject,
          message: contactDto.message,
          status: 'new',
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`Erreur lors de la sauvegarde du message: ${error.message}`);
        this.logger.error(`Détails de l'erreur:`, JSON.stringify(error, null, 2));
        
        // Vérifier si c'est une erreur RLS
        if (error.message && error.message.includes('row-level security')) {
          this.logger.error('⚠️ ERREUR RLS: Le backend doit utiliser SUPABASE_SERVICE_ROLE_KEY');
          this.logger.error('📝 Solution: Ajoutez SUPABASE_SERVICE_ROLE_KEY dans backend/.env');
          this.logger.error('🔗 Trouvez-la dans Supabase: Settings → API → service_role → secret');
        }
        
        throw new Error(`Erreur lors de la sauvegarde du message: ${error.message}`);
      }

      this.logger.log(`Message de contact sauvegardé avec succès (ID: ${data.id})`);

      // TODO: Ici vous pouvez ajouter :
      // - Envoi d'email (avec nodemailer, sendgrid, etc.)
      // - Notification Slack/Discord
      // - Intégration avec un CRM

      return {
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        messageId: data.id,
      };
    } catch (error: any) {
      this.logger.error(`Erreur lors du traitement du message de contact: ${error.message}`);
      throw error;
    }
  }

  async getContactMessagesByEmail(email: string) {
    try {
      this.logger.log(`🔍 Recherche de messages de contact pour l'email: ${email}`);
      
      // Normaliser l'email (minuscules, trim)
      const normalizedEmail = email.toLowerCase().trim();
      
      // Essayer d'abord avec l'email normalisé
      let { data, error } = await this.supabase.getClient()
        .from('contact_messages')
        .select('*')
        .eq('email', normalizedEmail)
        .order('created_at', { ascending: false });

      // Si aucun résultat avec l'email normalisé, essayer avec l'email original
      if (!error && (!data || data.length === 0)) {
        this.logger.log(`⚠️ Aucun résultat avec email normalisé, essai avec email original: ${email}`);
        const result = await this.supabase.getClient()
          .from('contact_messages')
          .select('*')
          .eq('email', email)
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        this.logger.error(`❌ Erreur lors de la récupération des messages: ${error.message}`);
        this.logger.error(`Détails de l'erreur:`, JSON.stringify(error, null, 2));
        throw new Error(`Erreur lors de la récupération des messages: ${error.message}`);
      }

      this.logger.log(`✅ ${data?.length || 0} message(s) trouvé(s) pour l'email: ${email}`);
      if (data && data.length > 0) {
        this.logger.log(`📋 Premiers messages:`, data.slice(0, 3).map(m => ({ id: m.id, subject: m.subject, email: m.email })));
      } else {
        this.logger.log(`⚠️ Aucun message trouvé. Vérifiez que l'email dans contact_messages correspond à: ${email}`);
      }

      return data || [];
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de la récupération des messages de contact: ${error.message}`);
      throw error;
    }
  }
}

