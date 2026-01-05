import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import { CreateQuickApplicationDto } from './dto/create-quick-application.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';
import { CrmService } from '../crm/crm.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CrmSyncStatus } from '../common/types/database.types';
import { Response } from 'express';

@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly uploadService: UploadService,
    private readonly crmService: CrmService,
    private readonly supabase: SupabaseService,
  ) {}

  @Post('quick-application')
  @UseInterceptors(FileInterceptor('cv'))
  async createQuickApplication(
    @Body() dto: CreateQuickApplicationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('CV requis');
    }

    // Upload du fichier
    const { fileName, filePath, fileSize } = await this.uploadService.uploadCv(file);

    // Créer la candidature
    const result = await this.candidatesService.createQuickApplication(
      dto,
      filePath,
      fileName,
      fileSize,
    );

    // Envoyer au CRM (asynchrone)
    this.crmService.syncCandidateToCrm(result.candidate, result.cvHistory).catch((error) => {
      console.error('Erreur lors de la synchronisation CRM:', error);
    });

    return {
      success: true,
      message: 'Candidature enregistrée avec succès',
      candidateId: result.candidate.id,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    console.log('🔍 getProfile - req.user:', JSON.stringify(req.user, null, 2));
    console.log('🔍 getProfile - req.user.id:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      throw new BadRequestException('Utilisateur non authentifié ou ID manquant');
    }
    
    return this.candidatesService.findOne(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateDto: UpdateCandidateDto) {
    return this.candidatesService.update(req.user.id, updateDto);
  }

  @Get('cv-history')
  @UseGuards(JwtAuthGuard)
  async getCvHistory(@Request() req) {
    return this.candidatesService.getCvHistory(req.user.id);
  }

  @Post('cv')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cv'))
  async uploadCv(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CV requis');
    }

    const candidate = await this.candidatesService.findOne(req.user.id);
    // Passer le candidateId pour utiliser le format {idCandidat}_{timestamp}.pdf
    const { fileName, filePath, fileSize } = await this.uploadService.uploadCv(file, candidate.id);

    const cvHistory = await this.supabase.createCvHistory({
      candidateId: candidate.id,
      fileName,
      filePath,
      fileSize,
      crmSyncStatus: CrmSyncStatus.PENDING,
    });

    // Envoyer au CRM
    this.crmService.syncCandidateToCrm(candidate, cvHistory).catch((error) => {
      console.error('Erreur lors de la synchronisation CRM:', error);
    });

    return {
      success: true,
      cvHistory,
    };
  }

  @Delete('cv/:cvId')
  @UseGuards(JwtAuthGuard)
  async deleteCv(@Request() req, @Param('cvId') cvId: string) {
    // Vérifier que le CV appartient au candidat
    const cvHistories = await this.supabase.findCvHistoryByCandidateId(req.user.id);
    const cv = cvHistories?.find(cv => cv.id === cvId);
    
    if (!cv) {
      throw new BadRequestException('CV non trouvé ou vous n\'avez pas l\'autorisation de supprimer ce CV');
    }

    // Supprimer le fichier du storage
    await this.uploadService.deleteCv(cv.fileName);

    // Supprimer l'entrée de la base de données
    await this.supabase.deleteCvHistory(cvId);

    return {
      success: true,
      message: 'CV supprimé avec succès',
    };
  }

  @Get('photo-history')
  @UseGuards(JwtAuthGuard)
  async getPhotoHistory(@Request() req) {
    return this.supabase.findPhotoHistoryByCandidateId(req.user.id);
  }

  @Post('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Photo requise');
    }

    const candidate = await this.candidatesService.findOne(req.user.id);

    // Upload de la nouvelle photo avec renommage {idCandidat}_{timestamp}.extension
    const { fileName, filePath, fileSize } = await this.uploadService.uploadPhoto(file, String(candidate.id));

    // Récupérer la dernière photo existante (s'il y en a une)
    const latestPhoto = await this.supabase.findLatestPhotoByCandidateId(candidate.id);

    // Enregistrer la nouvelle photo dans l'historique
    const photoHistory = await this.supabase.createPhotoHistory({
      candidateId: candidate.id,
      fileName,
      filePath,
      fileSize,
    });

    // Supprimer l'ancienne photo (fichier + enregistrement) si elle existe
    if (latestPhoto) {
      try {
        await this.uploadService.deletePhoto(latestPhoto.fileName);
        await this.supabase.deletePhotoHistory(latestPhoto.id);
      } catch (error) {
        console.error('Erreur lors de la suppression de l’ancienne photo:', error);
        // On n'empêche pas la réponse de succès, la nouvelle photo est déjà enregistrée
      }
    }

    return {
      success: true,
      photoHistory,
    };
  }

  @Get('photo/:id/url')
  @UseGuards(JwtAuthGuard)
  async getPhotoUrl(@Request() req, @Param('id') id: string) {
    const photo = await this.supabase.findPhotoHistoryById(id);
    if (!photo || photo.candidateId !== req.user.id) {
      throw new BadRequestException('Photo non trouvée ou non autorisée');
    }

    const url = await this.uploadService.getPhotoPublicUrl(photo.fileName);
    return { url };
  }

  @Get('photo/:id/file')
  @UseGuards(JwtAuthGuard)
  async getPhotoFile(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const photo = await this.supabase.findPhotoHistoryById(id);
    if (!photo || photo.candidateId !== req.user.id) {
      throw new BadRequestException('Photo non trouvée ou non autorisée');
    }

    const file = await this.uploadService.getPhotoFile(photo.fileName);
    res.setHeader('Content-Type', file.contentType);
    res.send(file.data);
  }

  @Delete('photo/:id')
  @UseGuards(JwtAuthGuard)
  async deletePhoto(@Request() req, @Param('id') id: string) {
    // Vérifier que la photo appartient au candidat
    const photo = await this.supabase.findPhotoHistoryById(id);
    if (!photo || photo.candidateId !== req.user.id) {
      throw new BadRequestException('Photo non trouvée ou non autorisée');
    }

    // Supprimer le fichier du storage
    await this.uploadService.deletePhoto(photo.fileName);

    // Supprimer l'entrée de la base de données
    await this.supabase.deletePhotoHistory(id);

    return {
      success: true,
      message: 'Photo supprimée avec succès',
    };
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  async deleteProfile(@Request() req) {
    await this.candidatesService.delete(req.user.id);
    return { success: true, message: 'Profil supprimé' };
  }

  // Télécharger le CV le plus récent du candidat connecté
  @Get('cv/latest/download')
  @UseGuards(JwtAuthGuard)
  async downloadLatestCv(@Request() req, @Res() res: Response) {
    const cvHistories = await this.supabase.findCvHistoryByCandidateId(req.user.id);
    if (!cvHistories || cvHistories.length === 0) {
      throw new BadRequestException('Aucun CV disponible');
    }

    const latestCv = cvHistories[0];
    const { data, contentType } = await this.uploadService.getCvFile(latestCv.fileName);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${latestCv.fileName}"`);
    res.send(data);
  }

  // Télécharger un CV spécifique par ID (vérifie que le CV appartient au candidat)
  @Get('cv/:cvId/download')
  @UseGuards(JwtAuthGuard)
  async downloadCvById(@Request() req, @Param('cvId') cvId: string, @Res() res: Response) {
    // Vérifier que le CV appartient au candidat connecté
    const cvHistories = await this.supabase.findCvHistoryByCandidateId(req.user.id);
    const cv = cvHistories?.find(cv => cv.id === cvId);
    
    if (!cv) {
      throw new BadRequestException('CV non trouvé ou vous n\'avez pas l\'autorisation de télécharger ce CV');
    }

    const { data, contentType } = await this.uploadService.getCvFile(cv.fileName);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${cv.fileName}"`);
    res.send(data);
  }

  // Télécharger un CV spécifique par nom de fichier (vérifie que le CV appartient au candidat)
  @Get('cv/file/:fileName/download')
  @UseGuards(JwtAuthGuard)
  async downloadCvByFileName(@Request() req, @Param('fileName') fileName: string, @Res() res: Response) {
    // Décoder le nom de fichier (peut être encodé dans l'URL)
    const decodedFileName = decodeURIComponent(fileName);
    // Extraire le nom de fichier si c'est un chemin complet
    const fileNameOnly = decodedFileName.split('/').pop() || decodedFileName;
    
    // Vérifier que le CV appartient au candidat connecté
    const cvHistories = await this.supabase.findCvHistoryByCandidateId(req.user.id);
    const cv = cvHistories?.find(cv => {
      const cvFileNameOnly = cv.fileName.split('/').pop() || cv.fileName;
      return cv.fileName === decodedFileName || 
             cv.fileName === fileNameOnly || 
             cvFileNameOnly === fileNameOnly ||
             cv.fileName.includes(fileNameOnly);
    });
    
    if (!cv) {
      throw new BadRequestException('CV non trouvé ou vous n\'avez pas l\'autorisation de télécharger ce CV');
    }

    const { data, contentType } = await this.uploadService.getCvFile(cv.fileName);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${cv.fileName}"`);
    res.send(data);
  }
}
