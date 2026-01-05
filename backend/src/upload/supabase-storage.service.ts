import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import * as crypto from 'crypto';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly bucketName = 'cvs';
  private readonly maxFileSize: number;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize = parseInt(this.configService.get<string>('MAX_FILE_SIZE', '20971520')); // 20 Mo
  }

  /**
   * Upload un CV vers Supabase Storage
   * @param file Fichier à uploader
   * @param candidateId ID du candidat (optionnel)
   * @returns Informations sur le fichier uploadé
   */
  async uploadCv(
    file: Express.Multer.File,
    candidateId?: string,
  ): Promise<{ fileName: string; filePath: string; fileSize: number; publicUrl: string }> {
    // Validation du type MIME
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Seuls les fichiers PDF sont acceptés');
    }

    // Validation de la taille
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `Le fichier ne doit pas dépasser ${Math.round(this.maxFileSize / 1024 / 1024)} Mo`,
      );
    }

    // Générer un nom de fichier unique et sécurisé
    const timestamp = Date.now();
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uniqueId}_${timestamp}_${sanitizedOriginalName}`;

    // Chemin dans le bucket (organisé par candidat si ID fourni)
    const folderPath = candidateId ? `candidates/${candidateId}` : 'quick-applications';
    const filePath = `${folderPath}/${fileName}`;

    try {
      // Upload vers Supabase Storage
      const { data, error } = await this.supabase.getClient().storage.from(this.bucketName).upload(
        filePath,
        file.buffer,
        {
          contentType: 'application/pdf',
          upsert: false, // Ne pas écraser si existe déjà
          cacheControl: '3600',
        },
      );

      if (error) {
        this.logger.error(`Erreur lors de l'upload vers Supabase Storage: ${error.message}`);
        throw new BadRequestException(`Erreur lors de l'upload du fichier: ${error.message}`);
      }

      // Obtenir l'URL publique du fichier
      const {
        data: { publicUrl },
      } = this.supabase.getClient().storage.from(this.bucketName).getPublicUrl(filePath);

      this.logger.log(`CV uploadé avec succès: ${filePath} (${file.size} bytes)`);

      return {
        fileName: sanitizedOriginalName, // Nom original pour l'affichage
        filePath: filePath, // Chemin dans Supabase Storage
        fileSize: file.size,
        publicUrl: publicUrl,
      };
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'upload CV: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supprimer un CV de Supabase Storage
   * @param filePath Chemin du fichier dans le bucket
   */
  async deleteCv(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.getClient().storage.from(this.bucketName).remove([filePath]);

      if (error) {
        this.logger.error(`Erreur lors de la suppression du CV: ${error.message}`);
        throw new BadRequestException(`Erreur lors de la suppression du fichier: ${error.message}`);
      }

      this.logger.log(`CV supprimé avec succès: ${filePath}`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de la suppression CV: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtenir l'URL publique d'un CV
   * @param filePath Chemin du fichier dans le bucket
   * @returns URL publique
   */
  getPublicUrl(filePath: string): string {
    const {
      data: { publicUrl },
    } = this.supabase.getClient().storage.from(this.bucketName).getPublicUrl(filePath);
    return publicUrl;
  }

  /**
   * Obtenir une URL signée (temporaire) pour télécharger un CV
   * @param filePath Chemin du fichier dans le bucket
   * @param expiresIn Durée de validité en secondes (défaut: 3600 = 1h)
   * @returns URL signée
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .storage.from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        this.logger.error(`Erreur lors de la génération de l'URL signée: ${error.message}`);
        throw new BadRequestException(`Erreur lors de la génération de l'URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la génération de l'URL signée: ${error.message}`);
      throw error;
    }
  }
}





