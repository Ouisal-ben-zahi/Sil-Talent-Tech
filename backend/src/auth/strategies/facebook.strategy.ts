import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const appId = configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = configService.get<string>('FACEBOOK_APP_SECRET');
    
    if (!appId || !appSecret) {
      console.warn('⚠️ FACEBOOK_APP_ID ou FACEBOOK_APP_SECRET non défini. La connexion Facebook sera désactivée.');
    }
    
    super({
      clientID: appId || 'dummy-app-id',
      clientSecret: appSecret || 'dummy-app-secret',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL', 'http://localhost:3001/api/auth/facebook/callback'),
      scope: ['email'],
      profileFields: ['emails', 'name', 'picture.type(large)'],
      // Forcer l'affichage de la sélection de compte Facebook
      authType: 'reauthenticate',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      provider: 'facebook',
      providerId: profile.id,
      accessToken,
    };
    done(null, user);
  }
}


