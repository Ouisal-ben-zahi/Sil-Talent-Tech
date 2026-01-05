import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key-change-in-production'),
    });
  }

  async validate(payload: any) {
    try {
      console.log('🔍 JwtStrategy.validate - payload:', JSON.stringify(payload, null, 2));
      console.log('🔍 JwtStrategy.validate - payload.sub:', payload.sub);
      
      const user = await this.authService.validateUser(payload.sub);
      
      if (!user) {
        console.error('❌ JwtStrategy.validate - Utilisateur non trouvé');
        throw new UnauthorizedException();
      }
      
      console.log('✅ JwtStrategy.validate - Utilisateur trouvé:', {
        id: user.id,
        email: user.email,
        type: 'passwordHash' in user ? 'candidate' : 'admin',
      });
      
      return user;
    } catch (error) {
      console.error('❌ JwtStrategy.validate - Erreur:', error.message);
      throw new UnauthorizedException();
    }
  }
}

