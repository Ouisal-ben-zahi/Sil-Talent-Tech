import { Module } from '@nestjs/common';
import { CandidaturesService } from './candidatures.service';
import { CandidaturesController } from './candidatures.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [SupabaseModule, CrmModule],
  controllers: [CandidaturesController],
  providers: [CandidaturesService],
  exports: [CandidaturesService],
})
export class CandidaturesModule {}






