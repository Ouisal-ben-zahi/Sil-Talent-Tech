import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UploadModule } from '../upload/upload.module';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    SupabaseModule,
    UploadModule,
    CrmModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

