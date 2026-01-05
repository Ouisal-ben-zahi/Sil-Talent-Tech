import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
  Post,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { UploadService } from '../upload/upload.service';
import { CrmService } from '../crm/crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly uploadService: UploadService,
    private readonly crmService: CrmService,
  ) {}

  @Get('candidates')
  async findAllCandidates(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('source') source?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('gender') gender?: string,
    @Query('expertiseLevel') expertiseLevel?: string,
    @Query('hasCv') hasCv?: string,
  ) {
    const filters: any = {};
    if (source) filters.source = source;
    if (country) filters.country = country;
    if (city) filters.city = city;
    if (gender) filters.gender = gender;
    if (expertiseLevel) filters.expertiseLevel = expertiseLevel;
    if (hasCv !== undefined) filters.hasCv = hasCv === 'true';

    return this.adminService.findAllCandidates(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      Object.keys(filters).length > 0 ? filters : undefined,
    );
  }

  @Get('candidates/:id')
  async findOneCandidate(@Param('id') id: string) {
    return this.adminService.findOneCandidate(id);
  }

  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  @Get('cvs/:fileName/download')
  async downloadCv(@Param('fileName') fileName: string, @Res() res: Response) {
    const { data, contentType } = await this.uploadService.getCvFile(fileName);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(data);
  }

  @Post('cvs/:cvHistoryId/retry-sync')
  async retrySync(@Param('cvHistoryId') cvHistoryId: string) {
    await this.crmService.retrySync(cvHistoryId);
    return { success: true, message: 'Nouvelle tentative de synchronisation lancée' };
  }

  @Post('candidates/:candidateId/sync-all-cvs')
  async syncAllCandidateCvs(@Param('candidateId') candidateId: string) {
    await this.crmService.syncAllCandidateCvsToCrm(candidateId);
    return { 
      success: true, 
      message: 'Tous les CV du candidat ont été synchronisés vers le CRM' 
    };
  }

  @Get('candidatures')
  async getAllCandidatures() {
    const candidatures = await this.adminService.getAllCandidaturesWithSource();
    console.log('📊 Candidatures retournées par le contrôleur:', candidatures.length);
    if (candidatures.length > 0) {
      console.log('📅 Première candidature du contrôleur:', {
        id: candidatures[0].id,
        datePostulation: candidatures[0].datePostulation,
        candidateGender: candidatures[0].candidateGender,
        typeDeMission: candidatures[0].typeDeMission
      });
    }
    return candidatures;
  }

  @Get('contact-messages/count')
  async getContactMessagesCount() {
    const count = await this.adminService.getContactMessagesCount();
    return { count };
  }

  @Get('contact-messages')
  async getAllContactMessages() {
    const messages = await this.adminService.getAllContactMessages();
    return messages;
  }

  @Get('filter-values')
  async getFilterValues() {
    return this.adminService.getFilterValues();
  }

  @Get('statistics/advanced')
  async getAdvancedStatistics() {
    return this.adminService.getAdvancedStatistics();
  }

  @Get('company-requests')
  async getAllCompanyRequests() {
    console.log('📧 Endpoint GET /admin/company-requests appelé');
    const requests = await this.adminService.getAllCompanyRequests();
    console.log(`✅ Retour de ${requests.length} demandes entreprise`);
    return requests;
  }
}

