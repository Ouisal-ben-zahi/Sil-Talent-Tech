import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { StrapiService } from '../strapi/strapi.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service pour gérer les fichiers PDF de manière sécurisée
 * Les fichiers sont stockés dans Supabase Storage et accessibles uniquement via API
 */
@Injectable()
export class SecureFileService {
  private readonly logger = new Logger(SecureFileService.name);
  private readonly resourcesBucket = 'resources'; // Bucket Supabase pour les ressources
  private readonly articlesImagesBucket = 'articles_imgs'; // Bucket Supabase pour les images d'articles

  constructor(
    private readonly strapiService: StrapiService,
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Télécharge un fichier depuis Strapi, l'enregistre localement et l'upload vers Supabase Storage
   * Retourne le chemin relatif du fichier (ex: /resources/file.pdf)
   */
  async syncFileFromStrapi(strapiFileUrl: string, fileName: string): Promise<string> {
    try {
      const client = this.supabaseService.getClient();

      // Télécharger le fichier depuis Strapi
      const fileBuffer = await this.strapiService.downloadFile(strapiFileUrl);

      // Nettoyer le nom de fichier (enlever les caractères spéciaux, garder l'extension)
      const fileExtension = fileName.split('.').pop() || 'pdf';
      const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
      const cleanFileName = `${baseName}.${fileExtension}`;
      
      // Chemin local dans frontend/public/resources
      // Depuis backend/, aller vers ../frontend/public/resources
      const backendDir = process.cwd(); // backend/
      const workspaceRoot = path.resolve(backendDir, '..'); // siltech/
      const frontendPublicPath = path.join(workspaceRoot, 'frontend', 'public', 'resources');
      const localFilePath = path.join(frontendPublicPath, cleanFileName);

      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(frontendPublicPath)) {
        fs.mkdirSync(frontendPublicPath, { recursive: true });
        this.logger.log(`✅ Dossier créé: ${frontendPublicPath}`);
      }

      // Enregistrer le fichier localement
      fs.writeFileSync(localFilePath, fileBuffer);
      this.logger.log(`✅ Fichier enregistré localement: ${localFilePath}`);

      // Upload vers Supabase Storage
      const { data, error } = await client.storage
        .from(this.resourcesBucket)
        .upload(cleanFileName, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true, // Écraser si le fichier existe déjà
        });

      if (error) {
        this.logger.warn(`⚠️ Erreur lors de l'upload vers Supabase Storage: ${error.message}`);
        // Continuer même en cas d'erreur Supabase, le fichier local est sauvegardé
      } else {
        this.logger.log(`✅ Fichier uploadé vers Supabase Storage: ${cleanFileName}`);
      }

      // Retourner le chemin relatif pour l'URL (ex: /resources/file.pdf)
      const relativePath = `/resources/${cleanFileName}`;

      this.logger.log(`✅ Fichier ${fileName} synchronisé. Chemin: ${relativePath}`);

      return relativePath;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la synchronisation du fichier ${strapiFileUrl}:`, error.message);
      throw new HttpException(
        `Erreur lors de la synchronisation du fichier: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Génère une URL signée pour télécharger un fichier de manière sécurisée
   * @param filePath Chemin du fichier dans Supabase Storage (ex: "resources/file.pdf")
   * @param expiresIn Durée de validité en secondes (défaut: 3600 = 1 heure)
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const client = this.supabaseService.getClient();

      // Extraire le bucket et le chemin
      const [bucket, ...pathParts] = filePath.split('/');
      const path = pathParts.join('/');

      const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw new Error(`Erreur lors de la génération de l'URL signée: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la génération de l'URL signée pour ${filePath}:`, error.message);
      throw new HttpException(
        `Erreur lors de la génération de l'URL signée: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Télécharge un fichier depuis Supabase Storage de manière sécurisée
   * @param filePath Chemin du fichier dans Supabase Storage
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    try {
      const client = this.supabaseService.getClient();

      // Extraire le bucket et le chemin
      const [bucket, ...pathParts] = filePath.split('/');
      const path = pathParts.join('/');

      const { data, error } = await client.storage
        .from(bucket)
        .download(path);

      if (error) {
        throw new Error(`Erreur lors du téléchargement du fichier: ${error.message}`);
      }

      // Convertir le Blob en Buffer
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      this.logger.error(`Erreur lors du téléchargement du fichier ${filePath}:`, error.message);
      throw new HttpException(
        `Erreur lors du téléchargement du fichier: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Supprime un fichier de Supabase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();

      // Extraire le bucket et le chemin
      const [bucket, ...pathParts] = filePath.split('/');
      const path = pathParts.join('/');

      const { error } = await client.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Erreur lors de la suppression du fichier: ${error.message}`);
      }

      this.logger.log(`✅ Fichier ${filePath} supprimé de Supabase Storage`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de la suppression du fichier ${filePath}:`, error.message);
      throw new HttpException(
        `Erreur lors de la suppression du fichier: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Synchronise une image d'article depuis Strapi vers Supabase Storage
   * Retourne l'URL publique de l'image dans Supabase
   */
  async syncArticleImageFromStrapi(strapiImageUrl: string, articleSlug: string, imageName?: string): Promise<string> {
    try {
      const client = this.supabaseService.getClient();

      // Télécharger l'image depuis Strapi
      const imageBuffer = await this.strapiService.downloadFile(strapiImageUrl);

      // Extraire le nom de fichier depuis l'URL ou utiliser le nom fourni
      const fileName = imageName || strapiImageUrl.split('/').pop() || 'image.jpg';
      const fileExtension = fileName.split('.').pop() || 'jpg';

      // Générer un nom de fichier unique basé sur le slug de l'article
      const sanitizedSlug = articleSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const uniqueFileName = `${sanitizedSlug}-${Date.now()}.${fileExtension}`;
      const filePath = `${uniqueFileName}`;

      // Déterminer le type MIME
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
      };
      const contentType = mimeTypes[fileExtension.toLowerCase()] || 'image/jpeg';

      // Créer le bucket s'il n'existe pas (avec gestion d'erreur)
      try {
        const { data: buckets } = await client.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === this.articlesImagesBucket);
        
        if (!bucketExists) {
          const { error: createError } = await client.storage.createBucket(this.articlesImagesBucket, {
            public: true, // Public pour permettre l'accès direct depuis le frontend
            fileSizeLimit: 5242880, // 5 MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
          });

          if (createError && !createError.message.includes('already exists')) {
            this.logger.warn(`⚠️ Erreur lors de la création du bucket ${this.articlesImagesBucket}: ${createError.message}`);
          } else {
            this.logger.log(`✅ Bucket ${this.articlesImagesBucket} créé avec succès`);
          }
        }
      } catch (bucketError: any) {
        this.logger.warn(`⚠️ Erreur lors de la vérification/création du bucket: ${bucketError.message}`);
      }

      // Upload vers Supabase Storage
      const { data, error } = await client.storage
        .from(this.articlesImagesBucket)
        .upload(filePath, imageBuffer, {
          contentType,
          upsert: true, // Écraser si le fichier existe déjà
        });

      if (error) {
        throw new Error(`Erreur lors de l'upload vers Supabase Storage: ${error.message}`);
      }

      // Obtenir l'URL publique de l'image
      const { data: publicUrlData } = client.storage
        .from(this.articlesImagesBucket)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      this.logger.log(`✅ Image ${fileName} synchronisée vers Supabase Storage: ${publicUrl}`);

      return publicUrl;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la synchronisation de l'image ${strapiImageUrl}:`, error.message);
      throw new HttpException(
        `Erreur lors de la synchronisation de l'image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Vérifie si un fichier existe dans Supabase Storage
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const client = this.supabaseService.getClient();

      // Extraire le bucket et le chemin
      const [bucket, ...pathParts] = filePath.split('/');
      const path = pathParts.join('/');

      const { data, error } = await client.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/') || '', {
          search: path.split('/').pop(),
        });

      if (error) {
        return false;
      }

      return Array.isArray(data) && data.length > 0;
    } catch (error: any) {
      return false;
    }
  }
}

