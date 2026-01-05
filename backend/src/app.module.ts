import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { CandidatesModule } from './candidates/candidates.module';
import { CrmModule } from './crm/crm.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { ContactModule } from './contact/contact.module';
import { CategoriesModule } from './categories/categories.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { CmsModule } from './cms/cms.module';
import { StrapiModule } from './strapi/strapi.module';
import { StrapiSyncModule } from './strapi-sync/strapi-sync.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { EntrepriseModule } from './entreprise/entreprise.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (général)
      },
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 5, // 5 tentatives de connexion par minute (sécurité)
      },
      {
        name: 'strict',
        ttl: 60000, // 1 minute
        limit: 20, // 20 requests per minute (endpoints sensibles)
      },
    ]),
    AuthModule,
    CandidatesModule,
    CrmModule,
    AdminModule,
    UploadModule,
    ContactModule,
    CategoriesModule,
    CandidaturesModule,
    CmsModule,
    StrapiModule,
    StrapiSyncModule,
    ChatbotModule,
    EntrepriseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
