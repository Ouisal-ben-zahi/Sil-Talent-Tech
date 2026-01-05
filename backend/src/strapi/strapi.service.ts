import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: {
    data?: {
      id: number;
      attributes: {
        url: string;
        alternativeText?: string;
      };
    };
  };
  category?: {
    data?: {
      id: number;
      attributes: {
        name: string;
        slug: string;
      };
    };
  };
  tags?: {
    data?: Array<{
      id: number;
      attributes: {
        name: string;
        slug: string;
      };
    }>;
  };
  status: 'draft' | 'published';
  author?: {
    data?: {
      id: number;
      attributes: {
        username: string;
      };
    };
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  views?: number;
  readingTime?: number;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiResource {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  file?: {
    data?: {
      id: number;
      attributes: {
        url: string;
        name: string;
        mime: string;
        size: number;
      };
    };
  };
  type: 'PDF' | 'Guide' | 'Template';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class StrapiService {
  private readonly logger = new Logger(StrapiService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly strapiUrl: string;
  private readonly strapiApiToken: string;

  constructor(private configService: ConfigService) {
    this.strapiUrl = this.configService.get<string>('STRAPI_URL') || 'http://168.231.82.55:1337';
    this.strapiApiToken = this.configService.get<string>('STRAPI_API_TOKEN') || '';

    if (!this.strapiApiToken) {
      this.logger.warn('⚠️ STRAPI_API_TOKEN n\'est pas configuré. La synchronisation ne fonctionnera pas.');
    }

    this.axiosInstance = axios.create({
      baseURL: `${this.strapiUrl}/api`,
      headers: {
        'Authorization': `Bearer ${this.strapiApiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Récupère un article depuis Strapi par son ID
   */
  async getArticle(id: number | string): Promise<StrapiArticle | null> {
    try {
      const response = await this.axiosInstance.get(`/articles/${id}`, {
        params: {
          populate: {
            featuredImage: true,
            category: true,
            tags: true,
            author: true,
            seo: true,
          },
        },
      });

      return this.mapStrapiResponse<StrapiArticle>(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Erreur lors de la récupération de l'article ${id}:`, error.message);
      throw new HttpException(
        `Erreur lors de la récupération de l'article depuis Strapi: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère tous les articles depuis Strapi
   */
  async getAllArticles(params?: {
    status?: 'draft' | 'published';
    page?: number;
    pageSize?: number;
  }): Promise<{ data: StrapiArticle[]; meta: any }> {
    try {
      // Construire les paramètres de requête
      const queryParams: any = {
        'pagination[page]': params?.page || 1,
        'pagination[pageSize]': params?.pageSize || 100,
        populate: {
          featuredImage: true,
          category: true,
          tags: true,
          author: true,
          seo: true,
        },
      };

      // Ajouter le filtre de statut seulement si spécifié
      // Essayer d'abord avec "status", puis avec "StatuS" (variation de casse)
      if (params?.status) {
        queryParams['filters[status][$eq]'] = params.status;
        // Essayer aussi avec StatuS au cas où le champ s'appelle ainsi
        queryParams['filters[StatuS][$eq]'] = params.status;
      }

      const response = await this.axiosInstance.get('/articles', {
        params: queryParams,
      });

      return {
        data: Array.isArray(response.data.data)
          ? response.data.data.map((item: any) => this.mapStrapiResponse<StrapiArticle>(item))
          : [],
        meta: response.data.meta || {},
      };
    } catch (error: any) {
      // Si erreur 400, c'est probablement que le Content-Type n'existe pas encore
      if (error.response?.status === 400) {
        this.logger.warn('⚠️ Le Content-Type "Article" n\'existe peut-être pas encore dans Strapi');
        this.logger.warn('💡 Créez d\'abord les modèles dans Strapi (voir STRAPI_MODELS_SETUP.md)');
        return { data: [], meta: {} };
      }
      
      // Si erreur 404, le Content-Type n'existe pas
      if (error.response?.status === 404) {
        this.logger.warn('⚠️ Le Content-Type "Article" n\'existe pas dans Strapi');
        this.logger.warn('💡 Créez d\'abord les modèles dans Strapi (voir STRAPI_MODELS_SETUP.md)');
        return { data: [], meta: {} };
      }

      this.logger.error('Erreur lors de la récupération des articles:', error.message);
      if (error.response?.data) {
        this.logger.error('Détails de l\'erreur:', JSON.stringify(error.response.data, null, 2));
      }
      throw new HttpException(
        `Erreur lors de la récupération des articles depuis Strapi: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère une ressource depuis Strapi par son ID
   */
  async getResource(id: number | string): Promise<StrapiResource | null> {
    try {
      const response = await this.axiosInstance.get(`/resources/${id}`, {
        params: {
          populate: {
            file: true,
          },
        },
      });

      return this.mapStrapiResponse<StrapiResource>(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Erreur lors de la récupération de la ressource ${id}:`, error.message);
      throw new HttpException(
        `Erreur lors de la récupération de la ressource depuis Strapi: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère toutes les ressources depuis Strapi
   */
  async getAllResources(params?: {
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: StrapiResource[]; meta: any }> {
    try {
      const paramsObj: any = {
        'pagination[page]': params?.page || 1,
        'pagination[pageSize]': params?.pageSize || 100,
        populate: {
          file: true,
        },
      };

      if (params?.type) {
        paramsObj['filters[type][$eq]'] = params.type;
      }

      const response = await this.axiosInstance.get('/resources', {
        params: paramsObj,
      });

      return {
        data: Array.isArray(response.data.data)
          ? response.data.data.map((item: any) => this.mapStrapiResponse<StrapiResource>(item))
          : [],
        meta: response.data.meta || {},
      };
    } catch (error: any) {
      // Si erreur 400 ou 404, c'est probablement que le Content-Type n'existe pas encore
      if (error.response?.status === 400 || error.response?.status === 404) {
        this.logger.warn('⚠️ Le Content-Type "Resource" n\'existe peut-être pas encore dans Strapi');
        this.logger.warn('💡 Créez d\'abord les modèles dans Strapi (voir STRAPI_MODELS_SETUP.md)');
        return { data: [], meta: {} };
      }

      this.logger.error('Erreur lors de la récupération des ressources:', error.message);
      if (error.response?.data) {
        this.logger.error('Détails de l\'erreur:', JSON.stringify(error.response.data, null, 2));
      }
      throw new HttpException(
        `Erreur lors de la récupération des ressources depuis Strapi: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère une catégorie depuis Strapi par son ID
   */
  async getCategory(id: number | string): Promise<StrapiCategory | null> {
    try {
      const response = await this.axiosInstance.get(`/categories/${id}`);
      return this.mapStrapiResponse<StrapiCategory>(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Erreur lors de la récupération de la catégorie ${id}:`, error.message);
      return null;
    }
  }

  /**
   * Récupère toutes les catégories depuis Strapi
   */
  async getAllCategories(): Promise<StrapiCategory[]> {
    try {
      const response = await this.axiosInstance.get('/categories', {
        params: {
          'pagination[pageSize]': 100,
        },
      });

      return Array.isArray(response.data.data)
        ? response.data.data.map((item: any) => this.mapStrapiResponse<StrapiCategory>(item))
        : [];
    } catch (error: any) {
      // Si erreur 400 ou 404, c'est probablement que le Content-Type n'existe pas encore
      if (error.response?.status === 400 || error.response?.status === 404) {
        this.logger.warn('⚠️ Le Content-Type "Category" n\'existe peut-être pas encore dans Strapi');
        this.logger.warn('💡 Créez d\'abord les modèles dans Strapi (voir STRAPI_MODELS_SETUP.md)');
        return [];
      }
      this.logger.error('Erreur lors de la récupération des catégories:', error.message);
      return [];
    }
  }

  /**
   * Récupère un tag depuis Strapi par son ID
   */
  async getTag(id: number | string): Promise<StrapiTag | null> {
    try {
      const response = await this.axiosInstance.get(`/tags/${id}`);
      return this.mapStrapiResponse<StrapiTag>(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Erreur lors de la récupération du tag ${id}:`, error.message);
      return null;
    }
  }

  /**
   * Récupère tous les tags depuis Strapi
   */
  async getAllTags(): Promise<StrapiTag[]> {
    try {
      const response = await this.axiosInstance.get('/tags', {
        params: {
          'pagination[pageSize]': 100,
        },
      });

      return Array.isArray(response.data.data)
        ? response.data.data.map((item: any) => this.mapStrapiResponse<StrapiTag>(item))
        : [];
    } catch (error: any) {
      // Si erreur 400 ou 404, c'est probablement que le Content-Type n'existe pas encore
      if (error.response?.status === 400 || error.response?.status === 404) {
        this.logger.warn('⚠️ Le Content-Type "Tag" n\'existe peut-être pas encore dans Strapi');
        this.logger.warn('💡 Créez d\'abord les modèles dans Strapi (voir STRAPI_MODELS_SETUP.md)');
        return [];
      }
      this.logger.error('Erreur lors de la récupération des tags:', error.message);
      return [];
    }
  }

  /**
   * Télécharge un fichier depuis Strapi de manière sécurisée
   */
  async downloadFile(fileUrl: string): Promise<Buffer> {
    try {
      // Construire l'URL complète du fichier
      const fullUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${this.strapiUrl}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;

      // Utiliser axios directement pour télécharger le fichier (pas via l'API)
      const response = await axios.get(fullUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${this.strapiApiToken}`,
        },
        timeout: 60000, // 60 secondes pour les gros fichiers
      });

      return Buffer.from(response.data);
    } catch (error: any) {
      this.logger.error(`Erreur lors du téléchargement du fichier ${fileUrl}:`, error.message);
      throw new HttpException(
        `Erreur lors du téléchargement du fichier depuis Strapi: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Mappe la réponse Strapi v4 vers notre format interne
   */
  private mapStrapiResponse<T>(data: any): T {
    if (!data) return data;

    // Strapi v4 retourne les données dans data.attributes
    if (data.attributes) {
      const mapped: any = {
        id: data.id,
        documentId: data.documentId || data.id.toString(),
        ...data.attributes,
      };

      // Normaliser les noms de champs (gérer les variations de casse)
      // StatuS -> status (mais garder StatuS aussi pour compatibilité)
      if (mapped.StatuS !== undefined && mapped.status === undefined) {
        mapped.status = mapped.StatuS;
        // Garder StatuS aussi pour compatibilité avec le code qui l'utilise
      }
      
      // publishedat -> publishedAt
      if (mapped.publishedat !== undefined && mapped.publishedAt === undefined) {
        mapped.publishedAt = mapped.publishedat;
      }
      
      // scheduledat -> scheduledAt
      if (mapped.scheduledat !== undefined && mapped.scheduledAt === undefined) {
        mapped.scheduledAt = mapped.scheduledat;
      }

      // Normaliser featuredImage (gérer Multiple Media -> prendre le premier)
      if (mapped.featuredImage?.data && Array.isArray(mapped.featuredImage.data)) {
        mapped.featuredImage = {
          data: mapped.featuredImage.data[0] || null,
        };
      }

      return mapped as T;
    }

    return data as T;
  }

  /**
   * Vérifie la connexion à Strapi
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/articles', {
        params: {
          'pagination[pageSize]': 1,
        },
      });
      return true;
    } catch (error: any) {
      this.logger.error('Erreur de connexion à Strapi:', error.message);
      return false;
    }
  }
}

