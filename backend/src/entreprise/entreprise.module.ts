import { Module } from '@nestjs/common'
import { EntrepriseController } from './entreprise.controller'
import { EntrepriseService } from './entreprise.service'
import { SupabaseModule } from '../supabase/supabase.module'
import { StrapiSyncModule } from '../strapi-sync/strapi-sync.module'

@Module({
  imports: [SupabaseModule, StrapiSyncModule],
  controllers: [EntrepriseController],
  providers: [EntrepriseService],
  exports: [EntrepriseService],
})
export class EntrepriseModule {}








