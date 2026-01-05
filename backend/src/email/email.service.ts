import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly gmailUser: string | undefined;
  private readonly gmailAppPassword: string | undefined;

  constructor(private configService: ConfigService) {
    this.gmailUser = this.configService.get<string>('GMAIL_USER');
    this.gmailAppPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');

    // Vérifier si les variables d'environnement sont configurées
    if (!this.gmailUser || !this.gmailAppPassword) {
      this.logger.warn('⚠️ GMAIL_USER ou GMAIL_APP_PASSWORD non configuré. L\'envoi d\'email sera désactivé.');
      this.logger.warn('💡 Consultez backend/docs/CONFIGURATION_GMAIL.md pour configurer Gmail.');
      return;
    }

    // Configuration du transporteur Gmail
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.gmailUser,
          pass: this.gmailAppPassword.replace(/\s/g, ''), // Supprimer les espaces du mot de passe d'application
        },
      });
      this.logger.log('✅ Service email Gmail configuré avec succès');
    } catch (error: any) {
      this.logger.error('❌ Erreur lors de la configuration du transporteur Gmail:', error.message);
      this.transporter = null;
    }
  }

  async sendPasswordResetCode(email: string, resetCode: string): Promise<boolean> {
    // Vérifier si le service email est configuré
    if (!this.transporter || !this.gmailUser) {
      this.logger.warn('⚠️ Service email non configuré. Impossible d\'envoyer l\'email.');
      return false;
    }

    try {
      const mailOptions = {
        from: this.gmailUser,
        to: email,
        subject: 'Code de réinitialisation de mot de passe',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Réinitialisation de mot de passe</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
              <h2 style="color: #297BFF; margin-top: 0;">Réinitialisation de mot de passe</h2>
              <p>Bonjour,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code suivant pour continuer :</p>
              <div style="background-color: #ffffff; border: 2px solid #297BFF; border-radius: 5px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #297BFF; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace;">${resetCode}</h1>
              </div>
              <p><strong>Ce code expire dans 15 minutes.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Cordialement,<br>
                L'équipe Sil Talents Tech
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
          Réinitialisation de mot de passe
          
          Bonjour,
          
          Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code suivant pour continuer :
          
          Code: ${resetCode}
          
          Ce code expire dans 15 minutes.
          
          Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
          
          Cordialement,
          L'équipe Sil Talents Tech
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email de réinitialisation envoyé avec succès à ${email}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email à ${email}:`, error.message);
      this.logger.error(`Détails de l'erreur:`, error);
      return false;
    }
  }
}

