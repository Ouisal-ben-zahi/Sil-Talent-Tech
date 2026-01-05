import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(OAuth2Strategy, 'linkedin') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('LINKEDIN_CLIENT_ID');
    const clientSecret = configService.get<string>('LINKEDIN_CLIENT_SECRET');
    
    if (!clientID || !clientSecret) {
      console.warn('⚠️ LINKEDIN_CLIENT_ID ou LINKEDIN_CLIENT_SECRET non défini. La connexion LinkedIn sera désactivée.');
    }
    
    // LinkedIn OpenID Connect endpoints
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: clientID || 'dummy-client-id',
      clientSecret: clientSecret || 'dummy-client-secret',
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL', 'http://localhost:3001/api/auth/linkedin/callback'),
      scope: ['openid', 'profile', 'email'],
      // LinkedIn utilise le format standard pour les paramètres
      customHeaders: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('✅ LinkedInStrategy initialisée avec OpenID Connect (openid, profile, email)');
    console.warn('⚠️ Assurez-vous que votre application LinkedIn a OpenID Connect activé dans LinkedIn Developers');
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    params: any,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      // LinkedIn OpenID Connect UserInfo endpoint
      // Note: LinkedIn peut utiliser différents endpoints selon la configuration
      const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const userInfo = userInfoResponse.data;
      
      console.log('📥 LinkedIn UserInfo reçu:', JSON.stringify(userInfo, null, 2));
      
      // LinkedIn OpenID Connect retourne les données dans un format standard OpenID Connect
      // Format attendu: { sub, email, given_name, family_name, picture, etc. }
      const user = {
        email: userInfo.email || userInfo.emailAddress,
        firstName: userInfo.given_name || userInfo.firstName || userInfo.localizedFirstName,
        lastName: userInfo.family_name || userInfo.lastName || userInfo.localizedLastName,
        picture: userInfo.picture || userInfo.profilePicture?.displayImage || null,
        provider: 'linkedin',
        providerId: userInfo.sub || userInfo.id, // sub est l'identifiant unique dans OpenID Connect
        accessToken,
      };
      
      console.log('✅ LinkedIn utilisateur extrait:', { email: user.email, providerId: user.providerId });
      done(null, user);
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des informations LinkedIn:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      done(error, null);
    }
  }
}


