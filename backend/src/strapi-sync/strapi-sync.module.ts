import { Module } from '@nestjs/common';
import { StrapiSyncService } from './strapi-sync.service';
import { StrapiSyncController } from './strapi-sync.controller';
import { SecureFileService } from './secure-file.service';
import { StrapiModule } from '../strapi/strapi.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [StrapiModule, SupabaseModule],
  controllers: [StrapiSyncController],
  providers: [StrapiSyncService, SecureFileService],
  exports: [StrapiSyncService, SecureFileService],
})
export class StrapiSyncModule {}

