import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { CandidatureStatus, MissionType } from '../../common/types/database.types';

export class CreateCandidatureDto {
  @IsUUID()
  @IsNotEmpty()
  categorieId: string;

  @IsString()
  @IsNotEmpty()
  cvPath: string;

  @IsEnum(MissionType)
  @IsOptional()
  typeDeMission?: MissionType;

  @IsEnum(CandidatureStatus)
  @IsOptional()
  statut?: CandidatureStatus = CandidatureStatus.EN_ATTENTE;
}

