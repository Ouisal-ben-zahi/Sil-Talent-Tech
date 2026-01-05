import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { StrapiService, StrapiArticle, StrapiResource, StrapiCategory, StrapiTag } from '../strapi/strapi.service';
import { SecureFileService } from './secure-file.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StrapiSyncService {
  private readonly logger = new Logger(StrapiSyncService.name);
  private readonly syncMapTable = 'strapi_sync_map'; // Table pour mapper Strapi ID → Supabase ID

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly strapiService: StrapiService,
    private readonly secureFileService: SecureFileService,
  ) {}

  /**
   * Synchronise un article depuis Strapi vers Supabase
   */
  async syncArticle(
    strapiArticleId: number | string, 
    event: 'entry.create' | 'entry.update' | 'entry.delete' = 'entry.update',
    strapiArticleData?: {
      title: string;
      slug: string;
      content: any;
      excerpt?: string;
      featuredImage?: any;
      category?: any;
      tags?: any[];
      status?: string;
      StatuS?: string;
      views?: number;
      readingTime?: number;
      publishedAt?: string;
      publishedat?: string;
      scheduledAt?: string;
      scheduledat?: string;
      author?: any;
      seo?: any;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      documentId?: string;
      createdAt?: string;
    }
  ): Promise<void> {
    try {
      const client = this.supabaseService.getClient();

      if (event === 'entry.delete') {
        await this.deleteArticle(strapiArticleId);
        return;
      }

      let strapiArticle: StrapiArticle | null = null;
      
      // Si les données sont fournies directement (depuis webhook), les utiliser
      if (strapiArticleData) {
        this.logger.debug(`📝 Article depuis payload webhook: ${strapiArticleData.title} (slug: ${strapiArticleData.slug})`);
        // Convertir les données du payload en format StrapiArticle
        // Le content peut être un tableau (Blocks) ou une string
        // Convertir les blocs Strapi en HTML si c'est un tableau
        const contentString = Array.isArray(strapiArticleData.content) 
          ? this.convertStrapiBlocksToHtml(strapiArticleData.content)
          : strapiArticleData.content;
        
        strapiArticle = {
          id: typeof strapiArticleId === 'number' ? strapiArticleId : parseInt(strapiArticleId.toString()) || 0,
          documentId: strapiArticleData.documentId || strapiArticleId.toString(),
          title: strapiArticleData.title,
          slug: strapiArticleData.slug,
          content: contentString,
          excerpt: strapiArticleData.excerpt,
          featuredImage: strapiArticleData.featuredImage ? {
            data: strapiArticleData.featuredImage.url ? {
              id: strapiArticleData.featuredImage.id || 0,
              attributes: {
                url: strapiArticleData.featuredImage.url,
                alternativeText: strapiArticleData.featuredImage.alternativeText,
              }
            } : undefined
          } : undefined,
          category: strapiArticleData.category ? {
            data: strapiArticleData.category.id ? {
              id: strapiArticleData.category.id,
              attributes: {
                name: strapiArticleData.category.name,
                slug: strapiArticleData.category.slug,
              }
            } : undefined
          } : undefined,
          tags: strapiArticleData.tags ? {
            data: strapiArticleData.tags.map(tag => ({
              id: tag.id,
              attributes: {
                name: tag.name,
                slug: tag.slug,
              }
            }))
          } : undefined,
          status: (strapiArticleData.status || strapiArticleData.StatuS || 'draft') as 'draft' | 'published',
          views: strapiArticleData.views,
          readingTime: strapiArticleData.readingTime,
          publishedAt: strapiArticleData.publishedAt || strapiArticleData.publishedat,
          scheduledAt: strapiArticleData.scheduledAt || strapiArticleData.scheduledat,
          createdAt: strapiArticleData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          seo: strapiArticleData.seo || (strapiArticleData.metaTitle || strapiArticleData.metaDescription || strapiArticleData.metaKeywords ? {
            metaTitle: strapiArticleData.metaTitle,
            metaDescription: strapiArticleData.metaDescription,
            metaKeywords: strapiArticleData.metaKeywords,
          } : undefined),
        };
      } else {
        // Sinon, récupérer depuis Strapi
        strapiArticle = await this.strapiService.getArticle(strapiArticleId);
        if (!strapiArticle) {
          this.logger.warn(`⚠️ Article ${strapiArticleId} non trouvé dans Strapi`);
          return;
        }
        this.logger.debug(`📝 Article récupéré depuis Strapi: ${strapiArticle.title} (slug: ${strapiArticle.slug})`);
      }

      // Utiliser documentId si disponible, sinon id
      const strapiIdentifier = strapiArticle.documentId || strapiArticle.id.toString();

      // Vérifier si l'article existe déjà dans Supabase
      // Si on a les données du payload, chercher directement par slug pour éviter l'appel API
      let existingId: string | null = null;
      if (strapiArticleData) {
        // Chercher d'abord dans le mapping
        const { data: mapping } = await client
          .from(this.syncMapTable)
          .select('supabase_id')
          .eq('strapi_table', 'articles')
          .eq('strapi_id', strapiIdentifier)
          .single();
        
        if (mapping) {
          existingId = mapping.supabase_id;
        } else {
          // Si pas de mapping, chercher par slug directement
          const { data: existingBySlug } = await client
            .from('articles')
            .select('id')
            .eq('slug', strapiArticle.slug)
            .single();
          
          if (existingBySlug) {
            existingId = existingBySlug.id;
            // Créer le mapping pour la prochaine fois
            await this.saveSyncMap('articles', strapiIdentifier, existingId);
          }
        }
      } else {
        // Si pas de données du payload, utiliser getSupabaseId (qui peut faire un appel API)
        existingId = await this.getSupabaseId('articles', strapiIdentifier);
      }

      // Synchroniser la catégorie si elle existe
      let categoryId: string | null = null;
      // Toujours privilégier les données du payload webhook si disponibles
      if (strapiArticleData?.category) {
        // Si les données viennent du payload webhook, utiliser directement documentId
        const categoryDocId = strapiArticleData.category.documentId || strapiArticleData.category.id.toString();
        this.logger.debug(`📝 Synchronisation de la catégorie depuis payload: ${strapiArticleData.category.name} (documentId: ${categoryDocId})`);
        categoryId = await this.syncCategory(categoryDocId, {
          name: strapiArticleData.category.name,
          slug: strapiArticleData.category.slug,
          description: strapiArticleData.category.description,
          color: strapiArticleData.category.color,
          documentId: strapiArticleData.category.documentId,
          createdAt: strapiArticleData.category.createdAt,
        });
      } else if (strapiArticle.category?.data) {
        // Utiliser documentId si disponible (depuis API Strapi), sinon id
        const categoryData = strapiArticle.category.data as any;
        const categoryStrapiId = categoryData.documentId || categoryData.id.toString();
        categoryId = await this.syncCategory(categoryStrapiId);
      }

      // Normaliser le statut (gérer StatuS avec majuscules)
      const articleStatus = strapiArticle.status || (strapiArticle as any).StatuS || 'draft';
      const normalizedStatus = articleStatus === 'published' ? 'Published' : 'Draft';

      // Gérer l'image featured (webhook vs API)
      // Télécharger l'image depuis Strapi et l'uploader vers Supabase Storage
      let featuredImageUrl: string | null = null;
      let strapiImageUrl: string | null = null;
      let imageName: string | null = null;

      if (strapiArticle.featuredImage?.data?.attributes?.url) {
        // Structure API standard
        strapiImageUrl = this.buildStrapiFileUrl(strapiArticle.featuredImage.data.attributes.url);
        const imageData = strapiArticle.featuredImage.data as any;
        imageName = imageData.attributes?.alternativeText || 
                   imageData.attributes?.name ||
                   imageData.name ||
                   strapiImageUrl.split('/').pop() || null;
      } else if (strapiArticleData?.featuredImage?.url) {
        // Structure webhook (directe)
        strapiImageUrl = this.buildStrapiFileUrl(strapiArticleData.featuredImage.url);
        imageName = strapiArticleData.featuredImage.name || 
                   strapiArticleData.featuredImage.alternativeText ||
                   strapiImageUrl.split('/').pop() || null;
      }

      // Si une image existe, la synchroniser vers Supabase Storage
      if (strapiImageUrl) {
        try {
          featuredImageUrl = await this.secureFileService.syncArticleImageFromStrapi(
            strapiImageUrl,
            strapiArticle.slug,
            imageName || undefined
          );
          this.logger.log(`✅ Image featured synchronisée vers Supabase Storage: ${featuredImageUrl}`);
        } catch (error: any) {
          this.logger.warn(`⚠️ Erreur lors de la synchronisation de l'image featured, utilisation de l'URL Strapi directe: ${error.message}`);
          // En cas d'erreur, utiliser l'URL Strapi directe comme fallback
          featuredImageUrl = strapiImageUrl;
        }
      }

      // Préparer les données pour Supabase
      // Convertir le contenu en HTML si c'est un tableau (Blocks format)
      let contentHtml = strapiArticle.content;
      if (typeof strapiArticle.content === 'string') {
        try {
          // Essayer de parser si c'est un JSON stringifié
          const parsed = JSON.parse(strapiArticle.content);
          if (Array.isArray(parsed)) {
            contentHtml = this.convertStrapiBlocksToHtml(parsed);
          }
        } catch (e) {
          // Si ce n'est pas du JSON, garder tel quel
          contentHtml = strapiArticle.content;
        }
      } else if (Array.isArray(strapiArticle.content)) {
        contentHtml = this.convertStrapiBlocksToHtml(strapiArticle.content);
      }

      const articleData: any = {
        title: strapiArticle.title,
        slug: strapiArticle.slug,
        content: contentHtml,
        excerpt: strapiArticle.excerpt || null,
        featured_image: featuredImageUrl,
        category_id: categoryId,
        status: normalizedStatus,
        author_id: strapiArticle.author?.data?.id?.toString() || null,
        meta_title: strapiArticle.seo?.metaTitle || (strapiArticle as any).metaTitle || null,
        meta_description: strapiArticle.seo?.metaDescription || (strapiArticle as any).metaDescription || null,
        meta_keywords: strapiArticle.seo?.metaKeywords || (strapiArticle as any).metaKeywords || null,
        views: strapiArticle.views || 0,
        reading_time: strapiArticle.readingTime || 0,
        published_at: strapiArticle.publishedAt || (strapiArticle as any).publishedat || null,
        scheduled_at: strapiArticle.scheduledAt || (strapiArticle as any).scheduledat || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingId) {
        // Mise à jour seulement si c'est une modification explicite depuis Strapi
        if (event === 'entry.create' || event === 'entry.update') {
          result = await client
            .from('articles')
            .update(articleData)
            .eq('id', existingId)
            .select()
            .single();
          
          this.logger.log(`✅ Article ${strapiArticle.title} synchronisé (mis à jour)`);
        } else {
          // Si l'article existe déjà, ne pas le modifier
          this.logger.debug(`Article ${strapiArticle.title} existe déjà dans Supabase - conservé tel quel`);
          return;
        }
      } else {
        // Création seulement si l'article n'existe pas
        // Vérifier aussi par slug pour éviter les doublons
        const { data: existingBySlug } = await client
          .from('articles')
          .select('id')
          .eq('slug', strapiArticle.slug)
          .single();
        
        if (existingBySlug) {
          // L'article existe déjà avec ce slug, ne pas créer de doublon
          this.logger.debug(`Article avec slug "${strapiArticle.slug}" existe déjà dans Supabase - ignoré`);
          // Créer le mapping pour référence future
          await this.saveSyncMap('articles', strapiIdentifier, existingBySlug.id);
          return;
        }
        
        // Création
        articleData.id = uuidv4();
        articleData.created_at = strapiArticle.createdAt || new Date().toISOString();
        
        result = await client
          .from('articles')
          .insert(articleData)
          .select()
          .single();

        if (result.error) {
          this.logger.error(`❌ Erreur lors de l'insertion de l'article:`, result.error);
          throw new Error(`Erreur Supabase: ${result.error.message}`);
        }

        if (!result.data) {
          this.logger.error(`❌ Aucune donnée retournée après insertion de l'article`);
          throw new Error('Aucune donnée retournée après insertion');
        }

        // Enregistrer le mapping Strapi → Supabase
        await this.saveSyncMap('articles', strapiIdentifier, result.data.id);
        
        this.logger.log(`✅ Article ${strapiArticle.title} synchronisé (créé)`);
      }

      // Synchroniser les tags
      if (strapiArticle.tags?.data && result.data) {
        await this.syncArticleTags(result.data.id, strapiArticle.tags.data);
      } else if (strapiArticleData?.tags && result.data) {
        // Si les tags viennent du payload webhook, synchroniser chaque tag puis créer les associations
        for (const tag of strapiArticleData.tags) {
          try {
            const tagDocId = tag.documentId || tag.id.toString();
            await this.syncTag(tagDocId, {
              name: tag.name,
              slug: tag.slug,
              documentId: tag.documentId,
              createdAt: tag.createdAt,
            });
          } catch (error: any) {
            this.logger.warn(`⚠️ Erreur lors de la synchronisation du tag ${tag.id}: ${error.message}`);
          }
        }
        // Créer les associations après avoir synchronisé tous les tags
        const tagsData = strapiArticleData.tags.map(tag => ({
          id: tag.id,
          documentId: tag.documentId,
          attributes: {
            name: tag.name,
            slug: tag.slug,
          }
        }));
        await this.syncArticleTags(result.data.id, tagsData);
      }

    } catch (error: any) {
      this.logger.error(`Erreur lors de la synchronisation de l'article ${strapiArticleId}:`, error.message);
      throw new HttpException(
        `Erreur lors de la synchronisation de l'article: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Synchronise une ressource depuis Strapi vers Supabase
   */
  async syncResource(
    strapiResourceId: number | string, 
    event: 'entry.create' | 'entry.update' | 'entry.delete' = 'entry.update',
    strapiResourceData?: { 
      title: string; 
      slug: string; 
      description?: string; 
      type: string;
      file?: any;
      documentId?: string;
      createdAt?: string;
      publishedAt?: string;
    }
  ): Promise<void> {
    try {
      const client = this.supabaseService.getClient();

      if (event === 'entry.delete') {
        await this.deleteResource(strapiResourceId);
        return;
      }

      let strapiResource: StrapiResource | null = null;
      
      // Si les données sont fournies directement (depuis webhook), les utiliser
      if (strapiResourceData) {
        this.logger.debug(`📝 Ressource depuis payload webhook: ${strapiResourceData.title} (slug: ${strapiResourceData.slug})`);
        // Convertir les données du payload en format StrapiResource
        strapiResource = {
          id: typeof strapiResourceId === 'number' ? strapiResourceId : parseInt(strapiResourceId.toString()) || 0,
          documentId: strapiResourceData.documentId || strapiResourceId.toString(),
          title: strapiResourceData.title,
          slug: strapiResourceData.slug,
          description: strapiResourceData.description,
          type: strapiResourceData.type as 'PDF' | 'Guide' | 'Template',
          file: strapiResourceData.file,
          publishedAt: strapiResourceData.publishedAt,
          createdAt: strapiResourceData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Sinon, récupérer depuis Strapi
        strapiResource = await this.strapiService.getResource(strapiResourceId);
        if (!strapiResource) {
          this.logger.warn(`⚠️ Ressource ${strapiResourceId} non trouvée dans Strapi`);
          return;
        }
        this.logger.debug(`📝 Ressource récupérée depuis Strapi: ${strapiResource.title} (slug: ${strapiResource.slug})`);
      }

      // Utiliser documentId si disponible, sinon id
      const strapiIdentifier = strapiResource.documentId || strapiResource.id.toString();

      // Vérifier si la ressource existe déjà dans Supabase
      const existingId = await this.getSupabaseId('resources', strapiIdentifier);

      // Synchroniser le fichier PDF vers Supabase Storage de manière sécurisée
      let fileUrl: string;
      
      // Essayer différentes structures pour le fichier (webhook vs API)
      // Structure 1: Depuis webhook (file.url directement)
      // Structure 2: Depuis API (file.data.attributes.url)
      let fileUrlPath: string | null = null;
      let fileName: string | null = null;
      
      // Vérifier si file est directement un objet avec url (webhook)
      if (strapiResource.file && typeof strapiResource.file === 'object') {
        const fileAny = strapiResource.file as any;
        if (fileAny.url) {
          fileUrlPath = fileAny.url;
          fileName = fileAny.name || `${strapiResource.slug}.pdf`;
        } else if (fileAny.data?.attributes?.url) {
          // Structure API standard
          fileUrlPath = fileAny.data.attributes.url;
          fileName = fileAny.data.attributes.name || `${strapiResource.slug}.pdf`;
        } else if (fileAny.data?.url) {
          // Structure alternative
          fileUrlPath = fileAny.data.url;
          fileName = fileAny.data.name || `${strapiResource.slug}.pdf`;
        }
      }
      
      if (fileUrlPath) {
        this.logger.debug(`📎 Fichier trouvé: ${fileUrlPath} (nom: ${fileName})`);
        
        try {
          // Télécharger depuis Strapi et uploader vers Supabase Storage
          fileUrl = await this.secureFileService.syncFileFromStrapi(
            this.buildStrapiFileUrl(fileUrlPath),
            fileName
          );
          this.logger.log(`✅ Fichier PDF synchronisé vers Supabase Storage: ${fileUrl}`);
        } catch (error: any) {
          this.logger.warn(`⚠️ Erreur lors de la synchronisation du fichier, utilisation de l'URL Strapi directe: ${error.message}`);
          // Fallback: utiliser l'URL Strapi directement si la synchronisation échoue
          fileUrl = this.buildStrapiFileUrl(fileUrlPath);
        }
      } else {
        this.logger.error(`❌ URL du fichier manquante dans Strapi pour la ressource ${strapiResource.title}`);
        this.logger.debug(`   Structure du fichier reçue: ${JSON.stringify(strapiResource.file, null, 2)}`);
        throw new Error('URL du fichier manquante dans Strapi');
      }

      // Préparer les données pour Supabase
      const resourceData: any = {
        title: strapiResource.title,
        slug: strapiResource.slug,
        description: strapiResource.description || null,
        file_url: fileUrl,
        type: strapiResource.type,
        published_at: strapiResource.publishedAt || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingId) {
        // Mise à jour (conserver le download_count existant)
        const { data: existing } = await client
          .from('resources')
          .select('download_count')
          .eq('id', existingId)
          .single();

        resourceData.download_count = existing?.download_count || 0;

        result = await client
          .from('resources')
          .update(resourceData)
          .eq('id', existingId)
          .select()
          .single();
        
        if (result.error) {
          this.logger.error(`❌ Erreur lors de la mise à jour de la ressource:`, result.error);
          throw new Error(`Erreur Supabase: ${result.error.message}`);
        }
        
        if (!result.data) {
          this.logger.error(`❌ Aucune donnée retournée après mise à jour de la ressource`);
          throw new Error('Aucune donnée retournée après mise à jour');
        }
        
        this.logger.log(`✅ Ressource ${strapiResource.title} synchronisée (mise à jour)`);
      } else {
        // Création
        resourceData.id = uuidv4();
        resourceData.download_count = 0;
        resourceData.created_at = strapiResource.createdAt || new Date().toISOString();
        
        // Essayer l'insertion avec retry en cas d'erreur de connexion
        let retries = 3;
        let lastError: any = null;
        
        while (retries > 0) {
          try {
            result = await client
              .from('resources')
              .insert(resourceData)
              .select()
              .single();

            if (result.error) {
              // Si c'est une erreur de connexion, réessayer
              if (result.error.message?.includes('fetch failed') || result.error.message?.includes('timeout')) {
                lastError = result.error;
                retries--;
                if (retries > 0) {
                  this.logger.warn(`⚠️ Erreur de connexion Supabase, nouvelle tentative (${retries} restantes)...`);
                  await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
                  continue;
                }
              }
              this.logger.error(`❌ Erreur lors de l'insertion de la ressource:`, result.error);
              this.logger.error(`   Données tentées:`, JSON.stringify(resourceData, null, 2));
              throw new Error(`Erreur Supabase: ${result.error.message}`);
            }

            if (!result.data) {
              this.logger.error(`❌ Aucune donnée retournée après insertion de la ressource`);
              throw new Error('Aucune donnée retournée après insertion');
            }
            
            // Succès, sortir de la boucle
            break;
          } catch (error: any) {
            // Si c'est une erreur de connexion, réessayer
            if (error.message?.includes('fetch failed') || error.message?.includes('timeout') || error.message?.includes('ConnectTimeoutError')) {
              lastError = error;
              retries--;
              if (retries > 0) {
                this.logger.warn(`⚠️ Erreur de connexion Supabase, nouvelle tentative (${retries} restantes)...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
                continue;
              }
            }
            // Si ce n'est pas une erreur de connexion ou si on a épuisé les tentatives, propager l'erreur
            throw error;
          }
        }
        
        // Si on arrive ici et qu'on n'a pas de résultat, c'est qu'on a épuisé les tentatives
        if (!result || !result.data) {
          this.logger.error(`❌ Échec de l'insertion après ${3} tentatives`);
          this.logger.error(`   Dernière erreur:`, lastError);
          throw new Error(`Erreur Supabase: Échec de connexion après plusieurs tentatives`);
        }

        // Enregistrer le mapping Strapi → Supabase
        await this.saveSyncMap('resources', strapiIdentifier, result.data.id);
        
        this.logger.log(`✅ Ressource ${strapiResource.title} synchronisée (créée)`);
      }

    } catch (error: any) {
      this.logger.error(`Erreur lors de la synchronisation de la ressource ${strapiResourceId}:`, error.message);
      this.logger.error(`   Détails: ${error.stack}`);
      throw new HttpException(
        `Erreur lors de la synchronisation de la ressource: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Synchronise une catégorie depuis Strapi vers Supabase
   */
  async syncCategory(
    strapiCategoryId: number | string,
    strapiCategoryData?: {
      name: string;
      slug: string;
      description?: string;
      color?: string;
      documentId?: string;
      createdAt?: string;
    }
  ): Promise<string> {
    try {
      const client = this.supabaseService.getClient();
      this.logger.debug(`🔄 Synchronisation de la catégorie ${strapiCategoryId}...`);

      let strapiCategory: StrapiCategory | null = null;
      
      // Si les données sont fournies directement (depuis webhook), les utiliser
      if (strapiCategoryData) {
        this.logger.debug(`📝 Catégorie depuis payload webhook: ${strapiCategoryData.name} (slug: ${strapiCategoryData.slug})`);
        // Convertir les données du payload en format StrapiCategory
        strapiCategory = {
          id: typeof strapiCategoryId === 'number' ? strapiCategoryId : parseInt(strapiCategoryId.toString()) || 0,
          documentId: strapiCategoryData.documentId || strapiCategoryId.toString(),
          name: strapiCategoryData.name,
          slug: strapiCategoryData.slug,
          description: strapiCategoryData.description,
          color: strapiCategoryData.color,
          createdAt: strapiCategoryData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Sinon, récupérer depuis Strapi
        strapiCategory = await this.strapiService.getCategory(strapiCategoryId);
        if (!strapiCategory) {
          this.logger.warn(`⚠️ Catégorie ${strapiCategoryId} non trouvée dans Strapi`);
          throw new Error(`Catégorie ${strapiCategoryId} non trouvée dans Strapi`);
        }
        this.logger.debug(`📝 Catégorie récupérée depuis Strapi: ${strapiCategory.name} (slug: ${strapiCategory.slug})`);
      }

      // Utiliser documentId si disponible, sinon id
      const strapiIdentifier = strapiCategory.documentId || strapiCategory.id.toString();
      this.logger.debug(`🔍 Recherche de la catégorie dans Supabase avec identifier: ${strapiIdentifier}`);

      // Vérifier si la catégorie existe déjà dans Supabase
      // Si on a les données du payload, chercher directement par slug pour éviter l'appel API
      let existingId: string | null = null;
      if (strapiCategoryData) {
        // Chercher d'abord dans le mapping
        const { data: mapping } = await client
          .from(this.syncMapTable)
          .select('supabase_id')
          .eq('strapi_table', 'categories_cms')
          .eq('strapi_id', strapiIdentifier)
          .single();
        
        if (mapping) {
          existingId = mapping.supabase_id;
        } else {
          // Si pas de mapping, chercher par slug directement
          const { data: existingBySlug } = await client
            .from('categories_cms')
            .select('id')
            .eq('slug', strapiCategory.slug)
            .single();
          
          if (existingBySlug) {
            existingId = existingBySlug.id;
            // Créer le mapping pour la prochaine fois
            await this.saveSyncMap('categories_cms', strapiIdentifier, existingId);
          }
        }
      } else {
        // Si pas de données du payload, utiliser getSupabaseId (qui peut faire un appel API)
        existingId = await this.getSupabaseId('categories_cms', strapiIdentifier);
      }

      const categoryData: any = {
        name: strapiCategory.name,
        slug: strapiCategory.slug,
        description: strapiCategory.description || null,
        color: strapiCategory.color || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingId) {
        // La catégorie existe déjà, ne pas la modifier (garder les anciennes données)
        this.logger.debug(`Catégorie ${strapiCategory.name} existe déjà dans Supabase - conservée telle quelle`);
        const { data: existingCategory } = await client
          .from('categories_cms')
          .select('id')
          .eq('id', existingId)
          .single();
        return existingCategory?.id || existingId;
      } else {
        // Vérifier aussi par slug pour éviter les doublons
        const { data: existingBySlug } = await client
          .from('categories_cms')
          .select('id')
          .eq('slug', strapiCategory.slug)
          .single();
        
        if (existingBySlug) {
          // La catégorie existe déjà avec ce slug, ne pas créer de doublon
          this.logger.debug(`Catégorie avec slug "${strapiCategory.slug}" existe déjà dans Supabase - ignorée`);
          // Créer le mapping pour référence future
          await this.saveSyncMap('categories_cms', strapiIdentifier, existingBySlug.id);
          return existingBySlug.id;
        }
        
        categoryData.id = uuidv4();
        categoryData.created_at = strapiCategory.createdAt || new Date().toISOString();
        
        result = await client
          .from('categories_cms')
          .insert(categoryData)
          .select()
          .single();

        if (result.error) {
          this.logger.error(`❌ Erreur lors de l'insertion de la catégorie:`, result.error);
          throw new Error(`Erreur Supabase: ${result.error.message}`);
        }

        if (!result.data) {
          this.logger.error(`❌ Aucune donnée retournée après insertion de la catégorie`);
          throw new Error('Aucune donnée retournée après insertion');
        }

        await this.saveSyncMap('categories_cms', strapiIdentifier, result.data.id);
        this.logger.log(`✅ Catégorie ${strapiCategory.name} synchronisée (créée)`);
      }

      return result.data.id;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la synchronisation de la catégorie ${strapiCategoryId}:`, error.message);
      throw error;
    }
  }

  /**
   * Synchronise un tag depuis Strapi vers Supabase
   */
  async syncTag(strapiTagId: number | string, strapiTagData?: { name: string; slug: string; documentId?: string; createdAt?: string }): Promise<string> {
    try {
      const client = this.supabaseService.getClient();
      this.logger.debug(`🔄 Synchronisation du tag ${strapiTagId}...`);
      
      let strapiTag: { name: string; slug: string; documentId?: string; id?: number | string; createdAt?: string };
      
      // Si les données sont fournies directement (depuis webhook), les utiliser
      if (strapiTagData) {
        strapiTag = strapiTagData;
        this.logger.debug(`📝 Tag depuis payload webhook: ${strapiTag.name} (slug: ${strapiTag.slug})`);
      } else {
        // Sinon, récupérer depuis Strapi
        // Essayer d'abord avec documentId si c'est une string qui ressemble à un documentId
        const fetchedTag = await this.strapiService.getTag(strapiTagId);
        
        if (!fetchedTag) {
          // Si l'ID numérique ne fonctionne pas, essayer avec documentId si disponible
          this.logger.warn(`⚠️ Tag ${strapiTagId} non trouvé dans Strapi avec ID numérique`);
          throw new Error(`Tag ${strapiTagId} non trouvé dans Strapi`);
        }
        
        strapiTag = fetchedTag;
        this.logger.debug(`📝 Tag récupéré depuis Strapi: ${strapiTag.name} (slug: ${strapiTag.slug})`);
      }

      // Utiliser documentId si disponible, sinon id
      const strapiIdentifier = strapiTag.documentId || strapiTag.id?.toString() || strapiTagId.toString();

      // Vérifier si le tag existe déjà dans Supabase
      const existingId = await this.getSupabaseId('tags', strapiIdentifier);

      const tagData: any = {
        name: strapiTag.name,
        slug: strapiTag.slug,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingId) {
        this.logger.debug(`🔄 Mise à jour du tag existant (ID Supabase: ${existingId})`);
        result = await client
          .from('tags')
          .update(tagData)
          .eq('id', existingId)
          .select()
          .single();
        
        if (result.error) {
          this.logger.error(`❌ Erreur lors de la mise à jour du tag:`, result.error);
          throw new Error(`Erreur Supabase: ${result.error.message}`);
        }
        
        this.logger.log(`✅ Tag ${strapiTag.name} synchronisé (mis à jour)`);
      } else {
        tagData.id = uuidv4();
        tagData.created_at = strapiTag.createdAt || new Date().toISOString();
        
        this.logger.debug(`➕ Création d'un nouveau tag dans Supabase...`);
        result = await client
          .from('tags')
          .insert(tagData)
          .select()
          .single();

        if (result.error) {
          this.logger.error(`❌ Erreur lors de l'insertion du tag:`, result.error);
          this.logger.error(`   Données tentées:`, JSON.stringify(tagData, null, 2));
          throw new Error(`Erreur Supabase: ${result.error.message}`);
        }

        if (!result.data) {
          this.logger.error(`❌ Aucune donnée retournée après insertion du tag`);
          throw new Error('Aucune donnée retournée après insertion');
        }

        await this.saveSyncMap('tags', strapiIdentifier, result.data.id);
        this.logger.log(`✅ Tag ${strapiTag.name} synchronisé (créé)`);
      }

      return result.data.id;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la synchronisation du tag ${strapiTagId}:`, error.message);
      throw error;
    }
  }

  /**
   * Synchronise les tags d'un article
   */
  private async syncArticleTags(articleId: string, strapiTags: Array<{ id: number; documentId?: string; attributes: { name: string; slug: string } }>): Promise<void> {
    try {
      const client = this.supabaseService.getClient();

      // Supprimer les associations existantes
      await client
        .from('article_tags')
        .delete()
        .eq('article_id', articleId);

      // Créer les nouvelles associations
      for (const strapiTag of strapiTags) {
        // Utiliser documentId si disponible (depuis payload webhook), sinon id
        const tagStrapiId = strapiTag.documentId || strapiTag.id.toString();
        const tagId = await this.syncTag(tagStrapiId);
        
        // Vérifier si l'association existe déjà
        const { data: existing } = await client
          .from('article_tags')
          .select('article_id, tag_id')
          .eq('article_id', articleId)
          .eq('tag_id', tagId)
          .single();

        // Insérer seulement si elle n'existe pas
        if (!existing) {
          await client
            .from('article_tags')
            .insert({
              article_id: articleId,
              tag_id: tagId,
            });
        }
      }
    } catch (error: any) {
      this.logger.error(`Erreur lors de la synchronisation des tags de l'article ${articleId}:`, error.message);
    }
  }

  /**
   * Supprime un article de Supabase
   */
  async deleteArticle(strapiArticleId: number | string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      const supabaseId = await this.getSupabaseId('articles', strapiArticleId.toString());
      
      if (supabaseId) {
        await client
          .from('articles')
          .delete()
          .eq('id', supabaseId);

        await this.deleteSyncMap('articles', strapiArticleId.toString());
        this.logger.log(`✅ Article ${strapiArticleId} supprimé de Supabase`);
      } else {
        this.logger.warn(`⚠️ Article ${strapiArticleId} non trouvé dans Supabase pour suppression`);
      }
    } catch (error: any) {
      this.logger.error(`Erreur lors de la suppression de l'article ${strapiArticleId}:`, error.message);
    }
  }

  /**
   * Supprime une ressource de Supabase
   */
  async deleteResource(strapiResourceId: number | string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      const supabaseId = await this.getSupabaseId('resources', strapiResourceId.toString());
      
      if (supabaseId) {
        await client
          .from('resources')
          .delete()
          .eq('id', supabaseId);

        await this.deleteSyncMap('resources', strapiResourceId.toString());
        this.logger.log(`✅ Ressource ${strapiResourceId} supprimée de Supabase`);
      } else {
        this.logger.warn(`⚠️ Ressource ${strapiResourceId} non trouvée dans Supabase pour suppression`);
      }
    } catch (error: any) {
      this.logger.error(`Erreur lors de la suppression de la ressource ${strapiResourceId}:`, error.message);
    }
  }

  /**
   * Supprime un tag de Supabase
   */
  async deleteTag(strapiTagId: number | string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      const supabaseId = await this.getSupabaseId('tags', strapiTagId.toString());
      
      if (supabaseId) {
        await client
          .from('tags')
          .delete()
          .eq('id', supabaseId);

        await this.deleteSyncMap('tags', strapiTagId.toString());
        this.logger.log(`✅ Tag ${strapiTagId} supprimé de Supabase`);
      } else {
        this.logger.warn(`⚠️ Tag ${strapiTagId} non trouvé dans Supabase pour suppression`);
      }
    } catch (error: any) {
      this.logger.error(`Erreur lors de la suppression du tag ${strapiTagId}:`, error.message);
    }
  }

  /**
   * Supprime une catégorie de Supabase
   */
  async deleteCategory(strapiCategoryId: number | string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      const supabaseId = await this.getSupabaseId('categories_cms', strapiCategoryId.toString());
      
      if (supabaseId) {
        await client
          .from('categories_cms')
          .delete()
          .eq('id', supabaseId);

        await this.deleteSyncMap('categories_cms', strapiCategoryId.toString());
        this.logger.log(`✅ Catégorie ${strapiCategoryId} supprimée de Supabase`);
      } else {
        this.logger.warn(`⚠️ Catégorie ${strapiCategoryId} non trouvée dans Supabase pour suppression`);
      }
    } catch (error: any) {
      this.logger.error(`Erreur lors de la suppression de la catégorie ${strapiCategoryId}:`, error.message);
    }
  }

  /**
   * Synchronise tous les contenus depuis Strapi vers Supabase
   */
  async syncAll(): Promise<{ articles: number; resources: number; categories: number; tags: number }> {
    this.logger.log('🔄 Début de la synchronisation complète Strapi → Supabase...');

    let articlesCount = 0;
    let resourcesCount = 0;
    let categoriesCount = 0;
    let tagsCount = 0;

    let articlesErrors = 0;
    let resourcesErrors = 0;
    let categoriesErrors = 0;
    let tagsErrors = 0;

    try {
      // Synchroniser les catégories (créer seulement les nouvelles, garder les existantes)
      const categories = await this.strapiService.getAllCategories();
      this.logger.log(`📁 ${categories.length} catégorie(s) trouvée(s) dans Strapi`);
      for (const category of categories) {
        try {
          const client = this.supabaseService.getClient();
          // Vérifier si la catégorie existe déjà par slug
          const { data: existing } = await client
            .from('categories_cms')
            .select('id')
            .eq('slug', category.slug)
            .single();
          
          if (!existing) {
            // Créer seulement si elle n'existe pas
            await this.syncCategory(category.id);
            categoriesCount++;
          } else {
            this.logger.debug(`Catégorie "${category.name}" existe déjà dans Supabase - conservée`);
          }
        } catch (error: any) {
          if (error.code !== 'PGRST116') { // PGRST116 = not found, c'est normal
            categoriesErrors++;
            this.logger.warn(`⚠️  Erreur lors de la synchronisation de la catégorie ${category.id}: ${error.message}`);
          }
        }
      }

      // Synchroniser les tags (créer seulement les nouveaux, garder les existants)
      const tags = await this.strapiService.getAllTags();
      this.logger.log(`🏷️  ${tags.length} tag(s) trouvé(s) dans Strapi`);
      for (const tag of tags) {
        try {
          const client = this.supabaseService.getClient();
          // Vérifier si le tag existe déjà par slug
          const { data: existing } = await client
            .from('tags')
            .select('id')
            .eq('slug', tag.slug)
            .single();
          
          if (!existing) {
            // Créer seulement s'il n'existe pas
            await this.syncTag(tag.id);
            tagsCount++;
          } else {
            this.logger.debug(`Tag "${tag.name}" existe déjà dans Supabase - conservé`);
          }
        } catch (error: any) {
          if (error.code !== 'PGRST116') { // PGRST116 = not found, c'est normal
            tagsErrors++;
            this.logger.warn(`⚠️  Erreur lors de la synchronisation du tag ${tag.id}: ${error.message}`);
          }
        }
      }

      // Synchroniser les articles (créer seulement les nouveaux, garder les existants)
      const articles = await this.strapiService.getAllArticles({ pageSize: 100 });
      this.logger.log(`📄 ${articles.data.length} article(s) trouvé(s) dans Strapi`);
      for (const article of articles.data) {
        try {
          const client = this.supabaseService.getClient();
          // Vérifier si l'article existe déjà par slug
          const { data: existing } = await client
            .from('articles')
            .select('id')
            .eq('slug', article.slug)
            .single();
          
          if (!existing) {
            // Créer seulement s'il n'existe pas
            await this.syncArticle(article.id, 'entry.create');
            articlesCount++;
          } else {
            this.logger.debug(`Article "${article.title}" existe déjà dans Supabase - conservé`);
          }
        } catch (error: any) {
          if (error.code !== 'PGRST116') { // PGRST116 = not found, c'est normal
            articlesErrors++;
            this.logger.warn(`⚠️  Erreur lors de la synchronisation de l'article ${article.id}: ${error.message}`);
          }
        }
      }

      // Synchroniser les ressources (créer seulement les nouvelles, garder les existantes)
      const resources = await this.strapiService.getAllResources({ pageSize: 100 });
      this.logger.log(`📦 ${resources.data.length} ressource(s) trouvée(s) dans Strapi`);
      for (const resource of resources.data) {
        try {
          const client = this.supabaseService.getClient();
          // Vérifier si la ressource existe déjà par slug
          const { data: existing } = await client
            .from('resources')
            .select('id')
            .eq('slug', resource.slug)
            .single();
          
          if (!existing) {
            // Créer seulement si elle n'existe pas
            await this.syncResource(resource.id, 'entry.create');
            resourcesCount++;
          } else {
            this.logger.debug(`Ressource "${resource.title}" existe déjà dans Supabase - conservée`);
          }
        } catch (error: any) {
          if (error.code !== 'PGRST116') { // PGRST116 = not found, c'est normal
            resourcesErrors++;
            this.logger.warn(`⚠️  Erreur lors de la synchronisation de la ressource ${resource.id}: ${error.message}`);
          }
        }
      }

      this.logger.log(`✅ Synchronisation complète terminée: ${articlesCount} articles, ${resourcesCount} ressources, ${categoriesCount} catégories, ${tagsCount} tags`);
      
      if (articlesErrors > 0 || resourcesErrors > 0 || categoriesErrors > 0 || tagsErrors > 0) {
        this.logger.warn(`⚠️  Erreurs rencontrées: ${articlesErrors} articles, ${resourcesErrors} ressources, ${categoriesErrors} catégories, ${tagsErrors} tags`);
      }
      
      return { articles: articlesCount, resources: resourcesCount, categories: categoriesCount, tags: tagsCount };
    } catch (error: any) {
      this.logger.error('Erreur critique lors de la synchronisation complète:', error.message);
      // Ne pas throw pour permettre de voir les résultats partiels
      this.logger.warn(`⚠️  Synchronisation partielle: ${articlesCount} articles, ${resourcesCount} ressources, ${categoriesCount} catégories, ${tagsCount} tags`);
      return { articles: articlesCount, resources: resourcesCount, categories: categoriesCount, tags: tagsCount };
    }
  }

  /**
   * Récupère l'ID Supabase correspondant à un ID Strapi
   */
  private async getSupabaseId(table: string, strapiId: string): Promise<string | null> {
    try {
      const client = this.supabaseService.getClient();
      
      // D'abord vérifier dans la table de mapping
      const { data: mapping } = await client
        .from(this.syncMapTable)
        .select('supabase_id')
        .eq('strapi_table', table)
        .eq('strapi_id', strapiId)
        .single();

      if (mapping) {
        return mapping.supabase_id;
      }

      // Si pas de mapping, chercher par slug (fallback)
      if (table === 'articles' || table === 'resources') {
        const strapiItem = table === 'articles' 
          ? await this.strapiService.getArticle(strapiId)
          : await this.strapiService.getResource(strapiId);

        if (strapiItem) {
          const { data: existing } = await client
            .from(table)
            .select('id')
            .eq('slug', strapiItem.slug)
            .single();

          if (existing) {
            // Créer le mapping pour la prochaine fois
            await this.saveSyncMap(table, strapiId, existing.id);
            return existing.id;
          }
        }
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération de l'ID Supabase pour ${table}:${strapiId}:`, error.message);
      return null;
    }
  }

  /**
   * Enregistre un mapping Strapi → Supabase
   */
  private async saveSyncMap(table: string, strapiId: string, supabaseId: string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      
      await client
        .from(this.syncMapTable)
        .upsert({
          strapi_table: table,
          strapi_id: strapiId,
          supabase_id: supabaseId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'strapi_table,strapi_id',
        });
    } catch (error: any) {
      // Si la table n'existe pas, on ignore l'erreur (le mapping est optionnel)
      if (error.message?.includes('does not exist')) {
        this.logger.warn(`Table ${this.syncMapTable} n'existe pas. Le mapping sera ignoré.`);
      } else {
        this.logger.error(`Erreur lors de l'enregistrement du mapping:`, error.message);
      }
    }
  }

  /**
   * Supprime un mapping Strapi → Supabase
   */
  private async deleteSyncMap(table: string, strapiId: string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      
      await client
        .from(this.syncMapTable)
        .delete()
        .eq('strapi_table', table)
        .eq('strapi_id', strapiId);
    } catch (error: any) {
      // Ignorer si la table n'existe pas
      if (!error.message?.includes('does not exist')) {
        this.logger.error(`Erreur lors de la suppression du mapping:`, error.message);
      }
    }
  }

  /**
   * Convertit les blocs Strapi (Blocks format) en HTML
   */
  private convertStrapiBlocksToHtml(blocks: any[]): string {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return '';
    }

    return blocks.map(block => {
      return this.convertBlockToHtml(block);
    }).join('');
  }

  /**
   * Convertit un bloc Strapi en HTML
   */
  private convertBlockToHtml(block: any): string {
    if (!block || !block.type) {
      return '';
    }

    const { type, children, ...attributes } = block;
    let html = '';

    // Traiter les enfants (texte, liens, etc.)
    const childrenHtml = Array.isArray(children)
      ? children.map((child: any) => {
          if (child.type === 'text') {
            let text = child.text || '';
            // Appliquer les formats (bold, italic, etc.)
            if (child.bold) text = `<strong>${text}</strong>`;
            if (child.italic) text = `<em>${text}</em>`;
            if (child.underline) text = `<u>${text}</u>`;
            if (child.strikethrough) text = `<s>${text}</s>`;
            if (child.code) text = `<code>${text}</code>`;
            return text;
          } else if (child.type === 'link') {
            const href = child.url || '#';
            const linkText = child.children?.map((c: any) => c.text || '').join('') || '';
            return `<a href="${href}">${linkText}</a>`;
          }
          return '';
        }).join('')
      : '';

    // Convertir selon le type de bloc
    switch (type) {
      case 'paragraph':
        return `<p>${childrenHtml}</p>`;
      case 'heading':
        const level = attributes.level || 1;
        return `<h${level}>${childrenHtml}</h${level}>`;
      case 'quote':
        return `<blockquote>${childrenHtml}</blockquote>`;
      case 'code':
        return `<pre><code>${childrenHtml}</code></pre>`;
      case 'list':
        const listType = attributes.format === 'ordered' ? 'ol' : 'ul';
        // Les enfants d'une liste sont des list-item
        const listItemsHtml = Array.isArray(children)
          ? children.map((item: any) => this.convertBlockToHtml(item)).join('')
          : childrenHtml;
        return `<${listType}>${listItemsHtml}</${listType}>`;
      case 'list-item':
        return `<li>${childrenHtml}</li>`;
      case 'image':
        const imageUrl = attributes.url || '';
        const alt = attributes.alternativeText || attributes.alt || '';
        return `<img src="${imageUrl}" alt="${alt}" />`;
      default:
        // Pour les types non reconnus, retourner le contenu des enfants
        return childrenHtml;
    }
  }

  /**
   * Construit l'URL complète d'un fichier Strapi
   */
  private buildStrapiFileUrl(url: string): string {
    const strapiUrl = process.env.STRAPI_URL || 'http://168.231.82.55:1337';
    
    if (url.startsWith('http')) {
      return url;
    }
    
    return `${strapiUrl}${url.startsWith('/') ? url : `/${url}`}`;
  }

  /**
   * Synchronise une demande entreprise vers le CRM
   */
  async syncCompanyRequestToCrm(crmData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    jobTitle: string;
    source: string;
    customFields?: {
      companySize?: string;
      sector?: string;
      location?: string;
      urgency?: string;
      message?: string;
    };
  }): Promise<void> {
    try {
      this.logger.log(`Synchronisation demande entreprise vers CRM: ${crmData.email}`);

      // TODO: Implémenter la synchronisation vers votre CRM (Strapi, HubSpot, Salesforce, etc.)
      // Exemple pour Strapi:
      // const strapiData = {
      //   data: {
      //     firstName: crmData.firstName,
      //     lastName: crmData.lastName,
      //     email: crmData.email,
      //     phone: crmData.phone,
      //     company: crmData.company,
      //     jobTitle: crmData.jobTitle,
      //     source: crmData.source,
      //     companySize: crmData.customFields?.companySize,
      //     sector: crmData.customFields?.sector,
      //     location: crmData.customFields?.location,
      //     urgency: crmData.customFields?.urgency,
      //     message: crmData.customFields?.message,
      //   },
      // };
      // await this.strapiService.createCompanyRequest(strapiData);

      // Pour l'instant, on log juste les données
      this.logger.log(`Données à synchroniser:`, JSON.stringify(crmData, null, 2));

      // Simuler une synchronisation réussie
      this.logger.log(`✅ Demande entreprise synchronisée vers CRM (simulation)`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de la synchronisation demande entreprise vers CRM:`, error);
      throw error;
    }
  }
}

