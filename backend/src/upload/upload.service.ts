import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private supabaseClient: SupabaseClient;
  private readonly bucketName = 'cvs';
  private readonly photosBucketName = 'photos';

  constructor(private configService: ConfigService) {
    this.initializeSupabaseClient();
  }

  private initializeSupabaseClient() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Utiliser SERVICE_ROLE_KEY pour avoir les permissions complètes sur Storage
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const key = supabaseServiceKey || supabaseAnonKey;
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL doit être configuré dans .env');
    }

    if (!key) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY doit être configuré dans .env');
    }

    if (!supabaseServiceKey) {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY n\'est pas configuré. L\'upload de CV peut échouer à cause de RLS.');
      console.warn('💡 Solution: Ajoutez SUPABASE_SERVICE_ROLE_KEY dans backend/.env');
    } else {
      console.log('✅ UploadService: Utilisation de SUPABASE_SERVICE_ROLE_KEY (bypass RLS)');
    }

    // Utiliser service_role key pour avoir les permissions complètes
    this.supabaseClient = createClient(supabaseUrl, key);
  }

  /**
   * Sauvegarde une copie locale du fichier sur le disque (en plus de Supabase).
   * Le chemin est relatif au répertoire de travail du backend (ex: backend/cvs, backend/photos_profile).
   */
  private async saveLocalFile(
    relativeDir: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<void> {
    try {
      const baseDir = process.cwd(); // normalement backend/
      const targetDir = path.join(baseDir, relativeDir);

      await fs.promises.mkdir(targetDir, { recursive: true });
      const targetPath = path.join(targetDir, fileName);

      await fs.promises.writeFile(targetPath, buffer);

      console.log('📁 Fichier sauvegardé localement:', {
        dir: relativeDir,
        path: targetPath,
        size: buffer.length,
      });
    } catch (error: any) {
      console.error(`❌ Erreur lors de la sauvegarde locale (${relativeDir}):`, error?.message || error);
      // On ne jette pas d'exception ici pour ne pas bloquer l'upload Supabase
    }
  }

  async uploadCv(file: Express.Multer.File, candidateId?: string): Promise<{ fileName: string; filePath: string; fileSize: number }> {
    // Validation du type MIME - Accepter PDF et Word
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Seuls les fichiers PDF et Word (.doc, .docx) sont acceptés');
    }

    // Validation de la taille (10 Mo max)
    const maxSize = parseInt(this.configService.get<string>('MAX_FILE_SIZE', '10485760')); // 10 Mo par défaut
    if (file.size > maxSize) {
      throw new BadRequestException(`Le fichier ne doit pas dépasser ${Math.round(maxSize / 1024 / 1024)} Mo`);
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    let fileName: string;
    
    if (candidateId) {
      // Format pour l'inscription : {idCandidat}_{timestamp}.pdf
      const fileExtension = file.originalname.split('.').pop() || 'pdf';
      // Nettoyer l'ID du candidat pour éviter les caractères spéciaux
      const safeCandidateId = String(candidateId).replace(/[^a-zA-Z0-9_-]/g, '_');
      fileName = `${safeCandidateId}_${timestamp}.${fileExtension}`;
      console.log(`📝 Renommage CV avec format inscription: ${fileName}`);
    } else {
      // Format pour les uploads ultérieurs : {uniqueId}_{timestamp}_{originalName}
      const uniqueId = crypto.randomBytes(4).toString('hex');
      const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      fileName = `${uniqueId}_${timestamp}_${sanitizedOriginalName}`;
    }

    console.log('📤 Upload du CV vers Supabase Storage...', { fileName, size: file.size });

    // Upload vers Supabase Storage
    const { data, error } = await this.supabaseClient.storage
      .from(this.bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype, // Utiliser le type MIME réel du fichier
        upsert: false, // Ne pas écraser si existe déjà
      });

    if (error) {
      console.error('❌ Erreur lors de l\'upload vers Supabase Storage:', error);
      console.error('Détails:', JSON.stringify(error, null, 2));
      
      // Vérifier si c'est une erreur RLS
      if (error.message && error.message.includes('row-level security')) {
        console.error('⚠️ ERREUR RLS: Le backend doit utiliser SUPABASE_SERVICE_ROLE_KEY');
        console.error('📝 Solution: Ajoutez SUPABASE_SERVICE_ROLE_KEY dans backend/.env');
        console.error('🔗 Trouvez-la dans Supabase: Settings → API → service_role → secret');
        console.error('💡 Vérifiez aussi que les politiques RLS sur le bucket "cvs" permettent l\'upload');
      }
      
      throw new BadRequestException(`Erreur lors de l'upload du CV: ${error.message}`);
    }

    console.log('✅ CV uploadé avec succès vers Supabase Storage:', { path: data.path });

    // Le filePath dans Supabase Storage est le chemin relatif dans le bucket
    const filePath = data.path;

    // Sauvegarde locale supplémentaire dans backend/cvs
    await this.saveLocalFile('cvs', fileName, file.buffer);

    return {
      fileName,
      filePath, // Chemin dans Supabase Storage (ex: "abc123_1234567890_CV.pdf")
      fileSize: file.size,
    };
  }

  async getCvFile(fileName: string): Promise<{ data: Buffer; contentType: string }> {
    console.log('📥 Téléchargement du CV depuis Supabase Storage...', { fileName });

    const { data, error } = await this.supabaseClient.storage
      .from(this.bucketName)
      .download(fileName);

    if (error) {
      console.error('❌ Erreur lors du téléchargement depuis Supabase Storage:', error);
      console.error('Détails:', JSON.stringify(error, null, 2));
      throw new BadRequestException(`Fichier non trouvé: ${error.message}`);
    }

    // Convertir le Blob en Buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Déterminer le Content-Type basé sur l'extension du fichier
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/pdf'; // Par défaut
    
    switch (fileExtension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'doc':
        contentType = 'application/msword';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        contentType = 'application/pdf';
    }

    console.log(`✅ CV téléchargé: ${fileName} (${contentType})`);

    return {
      data: buffer,
      contentType,
    };
  }

  async deleteCv(fileName: string): Promise<void> {
    console.log('🗑️  Suppression du CV depuis Supabase Storage...', { fileName });

    const { error } = await this.supabaseClient.storage
      .from(this.bucketName)
      .remove([fileName]);

    if (error) {
      console.error('❌ Erreur lors de la suppression depuis Supabase Storage:', error);
      // Ne pas throw d'erreur si le fichier n'existe pas déjà
      if (error.message && !error.message.includes('not found')) {
        throw new BadRequestException(`Erreur lors de la suppression: ${error.message}`);
      }
    } else {
      console.log('✅ CV supprimé avec succès de Supabase Storage');
    }
  }

  // Méthode pour obtenir l'URL publique (si nécessaire plus tard)
  async getCvPublicUrl(fileName: string): Promise<string> {
    const { data } = this.supabaseClient.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // Photo upload methods
  async uploadPhoto(
    file: Express.Multer.File,
    candidateId: string,
  ): Promise<{ fileName: string; filePath: string; fileSize: number }> {
    // Validation du type MIME (JPEG, PNG)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Seuls les fichiers JPEG et PNG sont acceptés');
    }

    // Validation de la taille (50 Mo max pour les photos)
    const maxSize = 50 * 1024 * 1024; // 50 Mo
    if (file.size > maxSize) {
      throw new BadRequestException(`Le fichier ne doit pas dépasser ${Math.round(maxSize / 1024 / 1024)} Mo`);
    }

    // Générer un nom de fichier unique: {idCandidat}_{timestamp}.extension
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const safeCandidateId = String(candidateId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeCandidateId}_${timestamp}.${fileExtension}`;

    console.log('📤 Upload de la photo vers Supabase Storage...', { fileName, size: file.size });

    // Upload vers Supabase Storage
    const { data, error } = await this.supabaseClient.storage
      .from(this.photosBucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false, // Ne pas écraser si existe déjà
      });

    if (error) {
      console.error('❌ Erreur lors de l\'upload vers Supabase Storage:', error);
      console.error('Détails:', JSON.stringify(error, null, 2));
      
      // Vérifier si c'est une erreur RLS
      if (error.message && error.message.includes('row-level security')) {
        console.error('⚠️ ERREUR RLS: Le backend doit utiliser SUPABASE_SERVICE_ROLE_KEY');
        console.error('📝 Solution: Ajoutez SUPABASE_SERVICE_ROLE_KEY dans backend/.env');
        console.error('🔗 Trouvez-la dans Supabase: Settings → API → service_role → secret');
        console.error('💡 Vérifiez aussi que les politiques RLS sur le bucket "photos" permettent l\'upload');
      }
      
      throw new BadRequestException(`Erreur lors de l'upload de la photo: ${error.message}`);
    }

    console.log('✅ Photo uploadée avec succès vers Supabase Storage:', { path: data.path });

    // Le filePath dans Supabase Storage est le chemin relatif dans le bucket
    const filePath = data.path;

    // Sauvegarde locale supplémentaire dans backend/photos_profile
    await this.saveLocalFile('photos_profile', fileName, file.buffer);

    return {
      fileName,
      filePath, // Chemin dans Supabase Storage (ex: "abc123_1234567890_photo.jpg")
      fileSize: file.size,
    };
  }

  async getPhotoFile(fileName: string): Promise<{ data: Buffer; contentType: string }> {
    console.log('📥 Téléchargement de la photo depuis Supabase Storage...', { fileName });

    const { data, error } = await this.supabaseClient.storage
      .from(this.photosBucketName)
      .download(fileName);

    if (error) {
      console.error('❌ Erreur lors du téléchargement depuis Supabase Storage:', error);
      throw new BadRequestException('Fichier non trouvé');
    }

    // Convertir le Blob en Buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      data: buffer,
      contentType: data.type || 'image/jpeg',
    };
  }

  async deletePhoto(fileName: string): Promise<void> {
    console.log('🗑️  Suppression de la photo depuis Supabase Storage...', { fileName });

    const { error } = await this.supabaseClient.storage
      .from(this.photosBucketName)
      .remove([fileName]);

    if (error) {
      console.error('❌ Erreur lors de la suppression depuis Supabase Storage:', error);
      // Ne pas throw d'erreur si le fichier n'existe pas déjà
      if (error.message && !error.message.includes('not found')) {
        throw new BadRequestException(`Erreur lors de la suppression: ${error.message}`);
      }
    } else {
      console.log('✅ Photo supprimée avec succès de Supabase Storage');
    }
  }

  async getPhotoPublicUrl(fileName: string): Promise<string> {
    // Utiliser une URL signée pour que la lecture fonctionne même si le bucket "photos" n'est pas public
    const { data, error } = await this.supabaseClient.storage
      .from(this.photosBucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365) // URL valable 1 an

    if (error || !data?.signedUrl) {
      console.error('❌ Erreur lors de la génération de l’URL signée pour la photo:', error)
      throw new BadRequestException('Impossible de générer l’URL publique de la photo')
    }

    return data.signedUrl
  }
}

