import { Controller, Post, Body, UseGuards, Request, Get, Param, Put, Delete } from '@nestjs/common';
import { CandidaturesService } from './candidatures.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Candidate, Admin } from '../common/types/database.types';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UpdateCandidatureStatusDto } from './dto/update-candidature-status.dto';

@Controller('candidatures')
export class CandidaturesController {
  constructor(private readonly candidaturesService: CandidaturesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() candidate: Candidate, @Body() createCandidatureDto: CreateCandidatureDto) {
    return this.candidaturesService.create(candidate.id, createCandidatureDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyCandidatures(@CurrentUser() candidate: Candidate) {
    return this.candidaturesService.findCandidaturesByCandidate(candidate.id);
  }

  @Get('by-categorie/:categorieId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findCandidaturesByCategorie(@Param('categorieId') categorieId: string) {
    return this.candidaturesService.findCandidaturesByCategorie(categorieId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.candidaturesService.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateCandidatureStatusDto) {
    return this.candidaturesService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.candidaturesService.remove(id);
  }
}






