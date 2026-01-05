import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    // Sécurité : Refuser de démarrer si JWT_SECRET n'est pas configuré ou utilise la valeur par défaut
    if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
      throw new Error(
        'JWT_SECRET doit être configuré avec une valeur sécurisée. ' +
        'Générez un secret avec: openssl rand -base64 32'
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      // Validation stricte du payload
      if (!payload || !payload.sub || typeof payload.sub !== 'string') {
        this.logger.warn('Token JWT invalide: payload.sub manquant ou invalide');
        throw new UnauthorizedException('Token invalide');
      }

      // Validation de l'expiration (déjà fait par passport-jwt, mais double vérification)
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        this.logger.warn('Token JWT expiré');
        throw new UnauthorizedException('Token expiré');
      }
      
      const user = await this.authService.validateUser(payload.sub);
      
      if (!user) {
        this.logger.warn(`Utilisateur non trouvé pour l'ID: ${payload.sub}`);
        throw new UnauthorizedException('Utilisateur non trouvé');
      }
      
      // Ne logger que les informations non sensibles en production
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Utilisateur validé: ${user.id} (${'passwordHash' in user ? 'candidate' : 'admin'})`);
      }
      
      return user;
    } catch (error) {
      // Ne pas exposer les détails de l'erreur en production
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Erreur lors de la validation du token JWT', error instanceof Error ? error.stack : error);
      throw new UnauthorizedException('Erreur d\'authentification');
    }
  }
}

