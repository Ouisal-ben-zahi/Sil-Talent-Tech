import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { CrmService } from './crm.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    SupabaseModule,
    ConfigModule,
    HttpModule,
  ],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}

