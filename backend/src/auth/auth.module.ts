import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';
import { UploadModule } from '../upload/upload.module';
import { CrmModule } from '../crm/crm.module';
import { CvValidationModule } from '../cv-validation/cv-validation.module';
import { EmailModule } from '../email/email.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { HCaptchaService } from './hcaptcha.service';

@Module({
  imports: [
    SupabaseModule,
    UploadModule,
    CrmModule,
    CvValidationModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        
        // Sécurité : Refuser de démarrer si JWT_SECRET n'est pas configuré
        if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
          throw new Error(
            'JWT_SECRET doit être configuré avec une valeur sécurisée. ' +
            'Générez un secret avec: openssl rand -base64 32'
          );
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
            // Ajouter l'algorithme explicitement pour plus de sécurité
            algorithm: 'HS256',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    HCaptchaService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    LinkedInStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}

