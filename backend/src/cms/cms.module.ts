import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule, HttpModule],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}


