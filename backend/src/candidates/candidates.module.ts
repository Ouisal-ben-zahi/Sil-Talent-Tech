import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { UploadModule } from '../upload/upload.module';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    SupabaseModule,
    UploadModule,
    CrmModule,
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
