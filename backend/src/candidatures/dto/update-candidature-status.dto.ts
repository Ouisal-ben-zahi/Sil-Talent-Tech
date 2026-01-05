import { IsEnum, IsNotEmpty } from 'class-validator';
import { CandidatureStatus } from '../../common/types/database.types';

export class UpdateCandidatureStatusDto {
  @IsEnum(CandidatureStatus)
  @IsNotEmpty()
  statut: CandidatureStatus;
}






