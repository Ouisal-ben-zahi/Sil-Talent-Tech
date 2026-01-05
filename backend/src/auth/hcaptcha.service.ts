import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class HCaptchaService {
  private readonly secretKey: string;
  private readonly verifyUrl = 'https://hcaptcha.com/siteverify';

  constructor(private configService: ConfigService) {
    const rawSecretKey = this.configService.get<string>('HCAPTCHA_SECRET_KEY') || '';
    
    // Nettoyer la clé secrète (supprimer les espaces, préfixes invalides, etc.)
    let cleanedSecretKey = rawSecretKey.trim().replace(/\s+/g, '');
    
    // Supprimer les préfixes invalides courants
    cleanedSecretKey = cleanedSecretKey.replace(/^(ES_|hcaptcha_|HCAPTCHA_|SECRET_)/i, '');
    
    this.secretKey = cleanedSecretKey;
    
    // Log détaillé au démarrage pour diagnostiquer
    console.log('🔐 Configuration hCaptcha:', {
      hasRawKey: !!rawSecretKey,
      rawKeyLength: rawSecretKey.length,
      rawKeyPreview: rawSecretKey.substring(0, 20) + (rawSecretKey.length > 20 ? '...' : ''),
      hasCleanedKey: !!this.secretKey,
      cleanedKeyLength: this.secretKey.length,
      cleanedKeyPreview: this.secretKey.substring(0, 20) + (this.secretKey.length > 20 ? '...' : ''),
      wasCleaned: rawSecretKey !== cleanedSecretKey,
    });
    
    if (!this.secretKey) {
      console.warn('⚠️ HCAPTCHA_SECRET_KEY non définie. La validation hCaptcha sera désactivée.');
    } else if (rawSecretKey !== cleanedSecretKey) {
      console.warn('⚠️ Clé secrète hCaptcha nettoyée (préfixes invalides supprimés)');
      console.warn('⚠️ Clé originale:', rawSecretKey.substring(0, 50));
      console.warn('⚠️ Clé nettoyée:', cleanedSecretKey.substring(0, 50));
    } else {
      console.log('✅ Clé secrète hCaptcha chargée correctement');
    }
  }

  async verifyToken(token: string, remoteip?: string): Promise<boolean> {
    // Si la clé secrète n'est pas configurée, accepter en mode développement
    if (!this.secretKey) {
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        console.warn('⚠️ Mode développement: validation hCaptcha ignorée (HCAPTCHA_SECRET_KEY non définie)');
        return true;
      }
      throw new BadRequestException('Configuration hCaptcha manquante');
    }

    if (!token) {
      console.error('❌ Token hCaptcha manquant');
      throw new BadRequestException('Token hCaptcha manquant');
    }

    // Log pour déboguer (masquer le token complet pour la sécurité)
    const tokenPreview = token.substring(0, 20) + '...';
    console.log('🔐 Vérification hCaptcha:', {
      tokenPreview,
      tokenLength: token.length,
      hasSecretKey: !!this.secretKey,
      secretKeyPreview: this.secretKey.substring(0, 10) + '...',
    });

    try {
      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token,
        ...(remoteip && { remoteip }),
      });

      console.log('📤 Requête vers hCaptcha:', {
        url: this.verifyUrl,
        hasRemoteIp: !!remoteip,
      });

      const response = await axios.post(
        this.verifyUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000, // 10 secondes de timeout
        },
      );

      const data = response.data;
      console.log('📥 Réponse hCaptcha:', {
        success: data.success,
        'error-codes': data['error-codes'] || [],
        'challenge-ts': data['challenge-ts'],
        hostname: data.hostname,
      });

      if (!data.success) {
        const errorCodes = data['error-codes'] || [];
        console.error('❌ Validation hCaptcha échouée:', {
          success: data.success,
          'error-codes': errorCodes,
          'error-messages': this.getErrorMessage(errorCodes),
        });
        return false;
      }

      console.log('✅ Validation hCaptcha réussie');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de la validation hCaptcha:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Si c'est une erreur de timeout ou réseau, permettre en développement
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      if (isDevelopment && (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND')) {
        console.warn('⚠️ Erreur réseau en développement, validation ignorée');
        return true;
      }
      
      throw new BadRequestException('Erreur lors de la validation hCaptcha');
    }
  }

  private getErrorMessage(errorCodes: string[]): string[] {
    const errorMessages: { [key: string]: string } = {
      'missing-input-secret': 'La clé secrète hCaptcha est manquante',
      'invalid-input-secret': 'La clé secrète hCaptcha est invalide',
      'missing-input-response': 'Le token hCaptcha est manquant',
      'invalid-input-response': 'Le token hCaptcha est invalide ou expiré',
      'bad-request': 'Requête mal formée',
      'invalid-or-already-seen-response': 'Le token a déjà été utilisé ou est invalide',
      'not-using-dummy-passcode': 'Le code de test n\'est pas utilisé correctement',
      'sitekey-secret-mismatch': 'La clé site ne correspond pas à la clé secrète',
    };

    return errorCodes.map(code => errorMessages[code] || code);
  }
}

