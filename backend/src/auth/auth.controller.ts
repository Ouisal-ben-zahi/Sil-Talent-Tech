import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, Get, Req, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { UploadService } from '../upload/upload.service';
import { CrmService } from '../crm/crm.service';
import { CvValidationService } from '../cv-validation/cv-validation.service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly uploadService: UploadService,
    private readonly crmService: CrmService,
    private readonly cvValidationService: CvValidationService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('cv'))
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Le CV est obligatoire pour l'inscription
    if (!file) {
      throw new BadRequestException('Le CV est obligatoire pour créer un compte');
    }

    // 1. Valider que le fichier est un vrai CV avant de continuer
    const validationResult = await this.cvValidationService.validateCv(file);
    
    if (!validationResult.isValid) {
      // Construire un message d'erreur détaillé
      const scorePercent = Math.round(validationResult.score * 100);
      const reasons = validationResult.reasons.join(', ');
      
      throw new BadRequestException(
        `Inscription refusée : fichier non valide. ` +
        `Le fichier envoyé n'est pas reconnu comme un CV. ` +
        `Score de confiance: ${scorePercent}%. ` +
        `Raisons: ${reasons}. ` +
        `Merci de télécharger un CV valide au format PDF ou Word contenant des sections typiques (expérience, formation, compétences, etc.).`
      );
    }

    // 2. Créer le candidat d'abord (sans CV) pour obtenir l'ID
    const candidate = await this.authService.createCandidateWithoutCv(registerDto);
    
    // 3. Uploader le CV avec le nom formaté {idCandidat}_{timestamp}.pdf
    let cvData = null;
    try {
      const uploadResult = await this.uploadService.uploadCv(file, candidate.id);
      cvData = {
        fileName: uploadResult.fileName,
        filePath: uploadResult.filePath,
        fileSize: uploadResult.fileSize,
      };
      console.log(`✅ CV uploadé avec le nom formaté: ${cvData.fileName}`);
    } catch (error: any) {
      // Si l'upload échoue, supprimer le candidat créé pour rollback
      console.error('❌ Erreur lors de l\'upload du CV, suppression du candidat:', error);
      try {
        await this.authService.deleteCandidate(candidate.id);
        console.log('✅ Candidat supprimé après échec upload');
      } catch (deleteError) {
        console.error('❌ Erreur lors de la suppression du candidat après échec upload:', deleteError);
      }
      throw new BadRequestException(`Erreur lors de l'upload du CV: ${error.message}`);
    }

    // 4. Créer le CV history et finaliser l'inscription
    const result = await this.authService.finalizeRegistration(candidate, cvData);

    // Envoyer au CRM si un CV a été fourni (asynchrone)
    if (result.cvHistory && result.id) {
      // Construire l'objet candidat complet pour le CRM
      // Note: passwordHash n'est pas nécessaire pour le CRM, on peut mettre null
      const candidate = {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        phone: result.phone,
        passwordHash: null as string | null, // Non nécessaire pour le CRM
        linkedin: result.linkedin,
        portfolio: result.portfolio,
        jobTitle: result.jobTitle,
        expertiseLevel: result.expertiseLevel,
        country: result.country,
        city: result.city,
        typeDeMissionSouhaite: result.typeDeMissionSouhaite || null,
        categoriePrincipaleId: result.categoriePrincipaleId || null,
        nationality: null, // Pas encore disponible lors de l'inscription
        dateOfBirth: null, // Pas encore disponible lors de l'inscription
        gender: null, // Pas encore disponible lors de l'inscription
        maritalStatus: null, // Pas encore disponible lors de l'inscription
        educationLevel: null, // Pas encore disponible lors de l'inscription
        professionalExperience: null, // Pas encore disponible lors de l'inscription
        biography: null, // Pas encore disponible lors de l'inscription
        source: result.source,
        isActive: result.isActive,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
      
      this.crmService.syncCandidateToCrm(candidate, result.cvHistory).catch((error) => {
        console.error('Erreur lors de la synchronisation CRM:', error);
      });
    }

    return result;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(
      adminLoginDto.email,
      adminLoginDto.password,
      adminLoginDto.hCaptchaToken,
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req: any, @Body() changePasswordDto: AdminChangePasswordDto) {
    // req.user est l'objet utilisateur retourné par validateUser, donc on utilise req.user.id
    const candidateId = req.user.id;
    console.log('🔐 ChangePassword - candidateId:', candidateId);
    return this.authService.changePassword(
      candidateId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('admin/change-password')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async adminChangePassword(@Request() req: any, @Body() changePasswordDto: AdminChangePasswordDto) {
    // req.user est l'objet utilisateur retourné par validateUser, donc on utilise req.user.id
    const adminId = req.user.id;
    console.log('🔐 AdminChangePassword - adminId:', adminId);
    return this.authService.adminChangePassword(
      adminId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.resetCode,
      resetPasswordDto.newPassword,
    );
  }

  @Post('admin/forgot-password')
  async adminForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.adminForgotPassword(forgotPasswordDto.email);
  }

  @Post('admin/reset-password')
  async adminResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.adminResetPassword(
      resetPasswordDto.email,
      resetPasswordDto.resetCode,
      resetPasswordDto.newPassword,
    );
  }

  // Google OAuth
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req: any) {
    // Cette route redirige vers Google via Passport
    // Le GoogleOAuthGuard force l'affichage de la sélection de compte
    // même si un compte Google est déjà connecté dans le navigateur
    console.log('🔐 Google OAuth - Redirection initiée (sélection de compte forcée)');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user;
      if (!user || !user.email) {
        throw new Error('Informations utilisateur manquantes');
      }
      
      const result = await this.authService.oauthLogin(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      if (result.needsRegistration && result.oauthData) {
        // Rediriger vers la page d'inscription avec les données pré-remplies
        const oauthData = result.oauthData;
        const redirectUrl = `${frontendUrl}/candidat/inscription?` +
          `email=${encodeURIComponent(oauthData.email)}&` +
          `firstName=${encodeURIComponent(oauthData.firstName)}&` +
          `lastName=${encodeURIComponent(oauthData.lastName)}&` +
          `provider=${encodeURIComponent(oauthData.provider)}&` +
          `oauth=true`;
        console.log('📝 Redirection vers la page d\'inscription avec données OAuth');
        res.redirect(redirectUrl);
      } else if ('accessToken' in result) {
        // Candidat existe, rediriger vers le login avec le token
        const redirectUrl = `${frontendUrl}/candidat/login?token=${result.accessToken}&isNewUser=false`;
        res.redirect(redirectUrl);
      } else {
        throw new Error('Réponse OAuth invalide');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du callback Google:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/candidat/login?error=${encodeURIComponent(error.message || 'Erreur de connexion')}`);
    }
  }

  // Facebook OAuth
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Cette route redirige vers Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user;
      if (!user || !user.email) {
        throw new Error('Informations utilisateur manquantes');
      }
      
      const result = await this.authService.oauthLogin(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      if (result.needsRegistration && result.oauthData) {
        // Rediriger vers la page d'inscription avec les données pré-remplies
        const oauthData = result.oauthData;
        const redirectUrl = `${frontendUrl}/candidat/inscription?` +
          `email=${encodeURIComponent(oauthData.email)}&` +
          `firstName=${encodeURIComponent(oauthData.firstName)}&` +
          `lastName=${encodeURIComponent(oauthData.lastName)}&` +
          `provider=${encodeURIComponent(oauthData.provider)}&` +
          `oauth=true`;
        console.log('📝 Redirection vers la page d\'inscription avec données OAuth');
        res.redirect(redirectUrl);
      } else if ('accessToken' in result) {
        // Candidat existe, rediriger vers le login avec le token
        const redirectUrl = `${frontendUrl}/candidat/login?token=${result.accessToken}&isNewUser=false`;
        res.redirect(redirectUrl);
      } else {
        throw new Error('Réponse OAuth invalide');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du callback Facebook:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/candidat/login?error=${encodeURIComponent(error.message || 'Erreur de connexion')}`);
    }
  }

  // LinkedIn OAuth
  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuth() {
    // Cette route redirige vers LinkedIn
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user;
      if (!user || !user.email) {
        throw new Error('Informations utilisateur manquantes');
      }
      
      const result = await this.authService.oauthLogin(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      if (result.needsRegistration && result.oauthData) {
        // Rediriger vers la page d'inscription avec les données pré-remplies
        const oauthData = result.oauthData;
        const redirectUrl = `${frontendUrl}/candidat/inscription?` +
          `email=${encodeURIComponent(oauthData.email)}&` +
          `firstName=${encodeURIComponent(oauthData.firstName)}&` +
          `lastName=${encodeURIComponent(oauthData.lastName)}&` +
          `provider=${encodeURIComponent(oauthData.provider)}&` +
          `oauth=true`;
        console.log('📝 Redirection vers la page d\'inscription avec données OAuth');
        res.redirect(redirectUrl);
      } else if ('accessToken' in result) {
        // Candidat existe, rediriger vers le login avec le token
        const redirectUrl = `${frontendUrl}/candidat/login?token=${result.accessToken}&isNewUser=false`;
        res.redirect(redirectUrl);
      } else {
        throw new Error('Réponse OAuth invalide');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du callback LinkedIn:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/candidat/login?error=${encodeURIComponent(error.message || 'Erreur de connexion')}`);
    }
  }
}

