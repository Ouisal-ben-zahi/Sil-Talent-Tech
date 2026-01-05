import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports: [SupabaseModule, CandidatesModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}

