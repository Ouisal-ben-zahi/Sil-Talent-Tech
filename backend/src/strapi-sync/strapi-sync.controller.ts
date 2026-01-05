import { Controller, Post, Body, Get, Query, Param, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { StrapiSyncService } from './strapi-sync.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface StrapiWebhookPayload {
  event: 'entry.create' | 'entry.update' | 'entry.delete' | 'entry.publish' | 'entry.unpublish';
  model: string;
  entry: {
    id: number;
    documentId?: string;
    [key: string]: any;
  };
}

@Controller('strapi-sync')
export class StrapiSyncController {
  private readonly logger = new Logger(StrapiSyncController.name);

  constructor(private readonly strapiSyncService: StrapiSyncService) {}

  /**
   * Webhook pour recevoir les événements de Strapi
   * ⚠️ IMPORTANT: Sécuriser cet endpoint avec un secret partagé dans la production
   */
  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Query('secret') secret?: string,
  ) {
    // Vérifier le secret (à configurer dans Strapi)
    const expectedSecret = process.env.STRAPI_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      this.logger.warn('⚠️ Tentative d\'accès au webhook avec un secret invalide');
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Log le payload complet pour debug
      this.logger.debug(`📥 Payload webhook reçu: ${JSON.stringify(payload, null, 2)}`);

      // Gérer différents formats de payload Strapi
      const event = payload.event || payload.type || payload.action;
      const model = payload.model || payload.entity?.type || payload.data?.type;
      
      // Extraire l'ID de différentes façons possibles
      let entryId: number | string | undefined;
      if (payload.entry?.id) {
        entryId = payload.entry.id;
      } else if (payload.entry?.documentId) {
        entryId = payload.entry.documentId;
      } else if (payload.data?.id) {
        entryId = payload.data.id;
      } else if (payload.entity?.id) {
        entryId = payload.entity.id;
      } else if (payload.id) {
        entryId = payload.id;
      }

      // Ignorer les événements media (mises à jour de fichiers)
      if (event === 'media.update' || event === 'media.create' || event === 'media.delete') {
        this.logger.debug(`📎 Événement média ignoré: ${event}`);
        return { success: true, message: 'Événement média ignoré (non synchronisé)' };
      }

      if (!event || !model || !entryId) {
        this.logger.error(`⚠️ Format de payload invalide. Payload: ${JSON.stringify(payload)}`);
        return { 
          success: false, 
          message: 'Format de payload invalide',
          received: { event, model, entryId }
        };
      }

      this.logger.log(`📥 Webhook reçu: ${event} sur ${model} (ID: ${entryId})`);

      // Mapper les événements Strapi
      let syncEvent: 'entry.create' | 'entry.update' | 'entry.delete' = 'entry.update';
      if (event === 'entry.create' || event === 'entry.publish' || event === 'create' || event === 'publish') {
        syncEvent = 'entry.create';
      } else if (event === 'entry.delete' || event === 'entry.unpublish' || event === 'delete' || event === 'unpublish') {
        syncEvent = 'entry.delete';
      }

      // Normaliser le nom du modèle
      const normalizedModel = model.toLowerCase().replace('api::', '').replace(/\./g, '');

      // Synchroniser selon le type de modèle
      switch (normalizedModel) {
        case 'articlearticle':
        case 'article':
          // Pour les suppressions, supprimer directement
          if (syncEvent === 'entry.delete') {
            const deleteId = payload.entry?.documentId || entryId;
            await this.strapiSyncService.deleteArticle(deleteId);
          } else {
            // Utiliser documentId si disponible, sinon id
            const syncId = payload.entry?.documentId || entryId;
            // Utiliser les données du payload si disponibles (évite un appel API)
            const articleData = payload.entry ? {
              title: payload.entry.title,
              slug: payload.entry.slug,
              content: payload.entry.content,
              excerpt: payload.entry.excerpt,
              featuredImage: payload.entry.featuredImage,
              category: payload.entry.category,
              tags: payload.entry.tags,
              status: payload.entry.status,
              StatuS: payload.entry.StatuS,
              views: payload.entry.views,
              readingTime: payload.entry.readingTime,
              publishedAt: payload.entry.publishedAt,
              publishedat: payload.entry.publishedat,
              scheduledAt: payload.entry.scheduledAt,
              scheduledat: payload.entry.scheduledat,
              author: payload.entry.author,
              seo: payload.entry.seo,
              metaTitle: payload.entry.metaTitle,
              metaDescription: payload.entry.metaDescription,
              metaKeywords: payload.entry.metaKeywords,
              documentId: payload.entry.documentId,
              createdAt: payload.entry.createdAt,
            } : undefined;
            await this.strapiSyncService.syncArticle(syncId, syncEvent, articleData);
          }
          break;

        case 'resourceresource':
        case 'resource':
          // Pour les suppressions, supprimer directement
          if (syncEvent === 'entry.delete') {
            const deleteId = payload.entry?.documentId || entryId;
            await this.strapiSyncService.deleteResource(deleteId);
          } else {
            // Utiliser documentId si disponible, sinon id
            const syncId = payload.entry?.documentId || entryId;
            // Utiliser les données du payload si disponibles (évite un appel API)
            const resourceData = payload.entry ? {
              title: payload.entry.title,
              slug: payload.entry.slug,
              description: payload.entry.description,
              type: payload.entry.type,
              file: payload.entry.file,
              documentId: payload.entry.documentId,
              createdAt: payload.entry.createdAt,
              publishedAt: payload.entry.publishedAt,
            } : undefined;
            await this.strapiSyncService.syncResource(syncId, syncEvent, resourceData);
          }
          break;

        case 'categorycategory':
        case 'category':
          // Pour les suppressions, supprimer directement
          if (syncEvent === 'entry.delete') {
            const deleteId = payload.entry?.documentId || entryId;
            await this.strapiSyncService.deleteCategory(deleteId);
          } else {
            // Utiliser documentId si disponible, sinon id
            const syncId = payload.entry?.documentId || entryId;
            // Utiliser les données du payload si disponibles (évite un appel API)
            const categoryData = payload.entry ? {
              name: payload.entry.name,
              slug: payload.entry.slug,
              description: payload.entry.description,
              color: payload.entry.color,
              documentId: payload.entry.documentId,
              createdAt: payload.entry.createdAt,
            } : undefined;
            await this.strapiSyncService.syncCategory(syncId, categoryData);
          }
          break;

        case 'tagtag':
        case 'tag':
          // Utiliser les données du payload directement (évite un appel API)
          if (syncEvent === 'entry.delete') {
            // Pour les suppressions, utiliser documentId si disponible
            const deleteId = payload.entry?.documentId || entryId;
            await this.strapiSyncService.deleteTag(deleteId);
          } else {
            // Utiliser documentId si disponible, sinon id
            const syncId = payload.entry?.documentId || entryId;
            // Utiliser les données du payload si disponibles (évite un appel API)
            const tagData = payload.entry ? {
              name: payload.entry.name,
              slug: payload.entry.slug,
              documentId: payload.entry.documentId,
              createdAt: payload.entry.createdAt,
            } : undefined;
            await this.strapiSyncService.syncTag(syncId, tagData);
          }
          break;

        default:
          this.logger.warn(`⚠️ Modèle ${model} (normalisé: ${normalizedModel}) non géré par le webhook`);
          return { success: false, message: `Modèle ${model} non géré` };
      }

      return { success: true, message: `${model} synchronisé avec succès` };
    } catch (error: any) {
      this.logger.error('Erreur lors du traitement du webhook:', error.message);
      this.logger.error('Stack:', error.stack);
      this.logger.error('Payload reçu:', JSON.stringify(payload, null, 2));
      throw new HttpException(
        `Erreur lors de la synchronisation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint manuel pour synchroniser un article spécifique
   */
  @Post('sync/article/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async syncArticle(@Param('id') id: string) {
    try {
      await this.strapiSyncService.syncArticle(id);
      return { success: true, message: `Article ${id} synchronisé avec succès` };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Endpoint manuel pour synchroniser une ressource spécifique
   */
  @Post('sync/resource/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async syncResource(@Param('id') id: string) {
    try {
      await this.strapiSyncService.syncResource(id);
      return { success: true, message: `Ressource ${id} synchronisée avec succès` };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Synchronisation complète (admin uniquement)
   */
  @Post('sync/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async syncAll() {
    try {
      const result = await this.strapiSyncService.syncAll();
      return {
        success: true,
        message: 'Synchronisation complète terminée',
        data: result,
      };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

