import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    
    // super() doit être appelé en premier
    super({
      clientID: clientID || 'dummy-client-id',
      clientSecret: clientSecret || 'dummy-client-secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:3001/api/auth/google/callback'),
      scope: ['email', 'profile'],
      // Forcer l'affichage de la sélection de compte à chaque fois
      // Même si un compte Google est déjà connecté dans le navigateur
      // Le paramètre prompt=select_account sera ajouté à l'URL d'autorisation Google
      authorizationParams: {
        prompt: 'select_account',
      },
    });
    
    // Logs après l'appel super()
    if (!clientID || !clientSecret) {
      console.warn('⚠️ GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET non défini. La connexion Google sera désactivée.');
      console.warn('💡 Ajoutez ces variables dans backend/.env pour activer OAuth Google');
    } else {
      console.log('✅ GoogleStrategy initialisée avec succès');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      provider: 'google',
      providerId: profile.id,
      accessToken,
    };
    done(null, user);
  }
}


