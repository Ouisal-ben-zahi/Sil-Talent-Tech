import { Module } from '@nestjs/common';
import { CvValidationService } from './cv-validation.service';

@Module({
  providers: [CvValidationService],
  exports: [CvValidationService],
})
export class CvValidationModule {}


















