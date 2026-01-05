import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApplicationSource, CrmSyncStatus } from '../common/types/database.types';
import { HCaptchaService } from './hcaptcha.service';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private jwtService: JwtService,
    private hCaptchaService: HCaptchaService,
    private emailService: EmailService,
  ) {}

  /**
   * Crée un candidat sans CV (pour obtenir l'ID avant l'upload)
   */
  async createCandidateWithoutCv(registerDto: RegisterDto) {
    console.log('🔐 Tentative d\'inscription:', { email: registerDto.email });
    
    const existingCandidate = await this.supabase.findCandidateByEmail(registerDto.email);

    if (existingCandidate) {
      console.log('⚠️ Candidat existe déjà:', { email: registerDto.email });
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    console.log('📝 Création du candidat dans Supabase (sans CV)...');
    console.log('📋 Données reçues dans RegisterDto:', {
      typeDeMissionSouhaite: registerDto.typeDeMissionSouhaite,
      categoriePrincipaleId: registerDto.categoriePrincipaleId,
    });
    
    const candidate = await this.supabase.createCandidate({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      phone: registerDto.phone,
      passwordHash,
      linkedin: registerDto.linkedin,
      portfolio: registerDto.portfolio,
      jobTitle: registerDto.jobTitle,
      expertiseLevel: registerDto.expertiseLevel,
      country: registerDto.country,
      city: registerDto.city,
      typeDeMissionSouhaite: registerDto.typeDeMissionSouhaite || null,
      categoriePrincipaleId: registerDto.categoriePrincipaleId || null,
      source: registerDto.source || ApplicationSource.PORTAL_REGISTRATION,
      isActive: true,
    });
    
    console.log('✅ Candidat créé avec succès:', { id: candidate.id, email: candidate.email });
    return candidate;
  }

  /**
   * Finalise l'inscription en créant le CV history et retournant le résultat complet
   */
  async finalizeRegistration(
    candidate: any,
    cvData: { fileName: string; filePath: string; fileSize: number },
  ) {
    console.log('📄 Finalisation de l\'inscription avec CV:', { candidateId: candidate.id, fileName: cvData.fileName });

    // Sauvegarder le CV dans la base de données
    const cvHistory = await this.supabase.createCvHistory({
      candidateId: candidate.id,
      fileName: cvData.fileName,
      filePath: cvData.filePath,
      fileSize: cvData.fileSize,
      crmSyncStatus: CrmSyncStatus.PENDING,
    });

    // Créer le token JWT avec l'ID du candidat
    const tokenPayload = { sub: candidate.id, email: candidate.email };
    const accessToken = this.jwtService.sign(tokenPayload);
    
    console.log('🔐 Token JWT créé:', {
      candidateId: candidate.id,
      candidateIdType: typeof candidate.id,
      tokenPayload,
      tokenLength: accessToken.length,
    });
    
    // Retourner une structure claire sans passwordHash
    return {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      linkedin: candidate.linkedin,
      portfolio: candidate.portfolio,
      jobTitle: candidate.jobTitle,
      expertiseLevel: candidate.expertiseLevel,
      country: candidate.country,
      city: candidate.city,
      typeDeMissionSouhaite: candidate.typeDeMissionSouhaite,
      categoriePrincipaleId: candidate.categoriePrincipaleId,
      source: candidate.source,
      isActive: candidate.isActive,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      cvHistory,
      accessToken,
    };
  }

  /**
   * Supprime un candidat (pour rollback en cas d'erreur)
   */
  async deleteCandidate(candidateId: string): Promise<void> {
    console.log('🗑️ Suppression du candidat:', { candidateId });
    await this.supabase.deleteCandidate(candidateId);
    console.log('✅ Candidat supprimé:', { candidateId });
  }

  /**
   * Méthode legacy - conservée pour compatibilité
   * @deprecated Utiliser createCandidateWithoutCv + finalizeRegistration à la place
   */
  async register(
    registerDto: RegisterDto,
    cvData?: { fileName: string; filePath: string; fileSize: number },
  ) {
    const candidate = await this.createCandidateWithoutCv(registerDto);
    if (cvData) {
      return this.finalizeRegistration(candidate, cvData);
    }
    
    // Si pas de CV, créer le token quand même
    const tokenPayload = { sub: candidate.id, email: candidate.email };
    const accessToken = this.jwtService.sign(tokenPayload);
    
    return {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      linkedin: candidate.linkedin,
      portfolio: candidate.portfolio,
      jobTitle: candidate.jobTitle,
      expertiseLevel: candidate.expertiseLevel,
      country: candidate.country,
      city: candidate.city,
      typeDeMissionSouhaite: candidate.typeDeMissionSouhaite,
      categoriePrincipaleId: candidate.categoriePrincipaleId,
      source: candidate.source,
      isActive: candidate.isActive,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      cvHistory: null,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    console.log('🔐 Tentative de connexion:', { email: loginDto.email });
    
    // Valider le token hCaptcha
    if (loginDto.hCaptchaToken) {
      try {
        const isValidCaptcha = await this.hCaptchaService.verifyToken(loginDto.hCaptchaToken);
        if (!isValidCaptcha) {
          console.log('❌ Validation hCaptcha échouée');
          // En développement, permettre la connexion même si hCaptcha échoue (pour faciliter les tests)
          const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
          if (isDevelopment) {
            console.warn('⚠️ Mode développement: connexion autorisée malgré l\'échec hCaptcha');
            // Continuer avec la connexion
          } else {
            throw new BadRequestException('Vérification anti-spam échouée. Veuillez réessayer.');
          }
        }
      } catch (error: any) {
        // En développement, permettre la connexion même en cas d'erreur hCaptcha
        const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
        if (isDevelopment && error.message.includes('hCaptcha')) {
          console.warn('⚠️ Mode développement: erreur hCaptcha ignorée, connexion autorisée');
          // Continuer avec la connexion
        } else {
          throw error;
        }
      }
    } else {
      // En production, exiger le token hCaptcha
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        throw new BadRequestException('Vérification anti-spam requise');
      }
    }
    
    const candidate = await this.supabase.findCandidateByEmail(loginDto.email);

    if (!candidate) {
      console.log('❌ Aucun candidat trouvé avec cet email:', loginDto.email);
      throw new UnauthorizedException('Aucun compte trouvé avec cet email');
    }

    console.log('✅ Candidat trouvé:', {
      id: candidate.id,
      email: candidate.email,
      hasPassword: !!candidate.passwordHash,
      isActive: candidate.isActive,
    });

    if (!candidate.passwordHash) {
      console.log('⚠️ Candidat sans mot de passe (candidature rapide)');
      throw new UnauthorizedException('Ce compte n\'a pas de mot de passe. Veuillez créer un compte via l\'inscription.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, candidate.passwordHash);

    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour:', loginDto.email);
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    if (!candidate.isActive) {
      console.log('❌ Compte désactivé pour:', loginDto.email);
      throw new UnauthorizedException('Compte désactivé');
    }

    console.log('✅ Connexion réussie pour:', loginDto.email);

    const { passwordHash: _, ...result } = candidate;
    return {
      ...result,
      accessToken: this.jwtService.sign({ sub: candidate.id, email: candidate.email }),
    };
  }

  async validateUser(userId: string) {
    console.log('🔍 AuthService.validateUser - userId reçu:', userId);
    console.log('🔍 AuthService.validateUser - type de userId:', typeof userId);
    
    // 1) Essayer en tant que candidat
    const candidate = await this.supabase.findCandidateById(userId);
    
    console.log('🔍 AuthService.validateUser - candidat trouvé:', {
      found: !!candidate,
      id: candidate?.id,
      email: candidate?.email,
      isActive: candidate?.isActive,
    });

    if (candidate) {
      if (!candidate.isActive) {
        console.error('❌ AuthService.validateUser - Candidat inactif');
        throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
      }
      console.log('✅ AuthService.validateUser - Candidat validé');
      return candidate;
    }

    // 2) Essayer en tant qu'admin
    const admin = await this.supabase.findAdminById(userId);

    if (admin) {
      if (!admin.isActive) {
        console.error('❌ AuthService.validateUser - Admin inactif');
        throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
      }
      console.log('✅ AuthService.validateUser - Admin validé');
      return admin;
    }

    console.error('❌ AuthService.validateUser - Aucun utilisateur trouvé avec cet ID');
    throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
  }

  async adminLogin(email: string, password: string, hCaptchaToken?: string) {
    console.log('🔐 Tentative de connexion admin:', { email });
    
    // Valider le token hCaptcha
    if (hCaptchaToken) {
      try {
        const isValidCaptcha = await this.hCaptchaService.verifyToken(hCaptchaToken);
        if (!isValidCaptcha) {
          console.log('❌ Validation hCaptcha échouée pour admin');
          // En développement, permettre la connexion même si hCaptcha échoue (pour faciliter les tests)
          const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
          if (isDevelopment) {
            console.warn('⚠️ Mode développement: connexion admin autorisée malgré l\'échec hCaptcha');
            // Continuer avec la connexion
          } else {
            throw new BadRequestException('Vérification anti-spam échouée. Veuillez réessayer.');
          }
        }
      } catch (error: any) {
        // En développement, permettre la connexion même en cas d'erreur hCaptcha
        const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
        if (isDevelopment && error.message.includes('hCaptcha')) {
          console.warn('⚠️ Mode développement: erreur hCaptcha ignorée pour admin, connexion autorisée');
          // Continuer avec la connexion
        } else {
          throw error;
        }
      }
    } else {
      // En production, exiger le token hCaptcha
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        throw new BadRequestException('Vérification anti-spam requise');
      }
    }
    
    const admin = await this.supabase.findAdminByEmail(email);

    if (!admin) {
      console.log('❌ Admin non trouvé avec cet email:', email);
      throw new UnauthorizedException('Identifiants invalides');
    }

    console.log('✅ Admin trouvé:', {
      id: admin.id,
      email: admin.email,
      hasPassword: !!admin.passwordHash,
      isActive: admin.isActive,
    });

    if (!admin.passwordHash) {
      console.log('❌ Admin sans mot de passe hashé');
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour admin:', email);
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!admin.isActive) {
      console.log('❌ Compte admin désactivé:', email);
      throw new UnauthorizedException('Compte désactivé');
    }

    console.log('✅ Connexion admin réussie pour:', email);

    const { passwordHash: _, ...result } = admin;
    return {
      ...result,
      accessToken: this.jwtService.sign({
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      }),
    };
  }

  async forgotPassword(email: string) {
    console.log('🔐 Tentative de réinitialisation de mot de passe:', { email });
    
    // Vérifier si le candidat existe
    const candidate = await this.supabase.findCandidateByEmail(email);
    
    if (!candidate) {
      // Ne pas révéler que l'email n'existe pas (sécurité)
      console.log('⚠️ Email non trouvé (ne pas révéler à l\'utilisateur)');
      return {
        success: true,
        message: 'Si cet email existe dans notre système, vous recevrez un code de réinitialisation.',
      };
    }

    if (!candidate.passwordHash) {
      console.log('⚠️ Candidat sans mot de passe (candidature rapide)');
      return {
        success: false,
        message: 'Ce compte n\'a pas de mot de passe. Veuillez créer un compte via l\'inscription.',
      };
    }

    // Générer un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Le code expire dans 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Sauvegarder le code dans la base de données
    console.log('💾 Tentative de sauvegarde du code dans Supabase...');
    const { data, error } = await this.supabase.getClient()
      .from('password_reset_tokens')
      .insert({
        candidate_id: candidate.id,
        email: candidate.email,
        reset_code: resetCode,
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la sauvegarde du code de réinitialisation:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      console.error('💡 Vérifiez que la table "password_reset_tokens" existe dans Supabase');
      console.error('💡 Exécutez le script: backend/supabase-password-reset-table.sql');
      
      // Même en cas d'erreur, on retourne le code en développement pour permettre les tests
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        console.log('⚠️ Erreur Supabase, mais on retourne le code quand même en DEV');
        return {
          success: true,
          message: 'Code généré (mais erreur lors de la sauvegarde - vérifiez Supabase)',
          resetCode,
        };
      }
      
      throw new Error('Erreur lors de la génération du code de réinitialisation');
    }
    
    console.log('✅ Code sauvegardé dans Supabase:', data);

    console.log('✅ Code de réinitialisation généré:', {
      email: candidate.email,
      resetCode,
      expiresAt: expiresAt.toISOString(),
    });

    // Envoyer l'email avec le code de réinitialisation
    try {
      const emailSent = await this.emailService.sendPasswordResetCode(candidate.email, resetCode);
      
      if (emailSent) {
        console.log('✅ Email de réinitialisation envoyé avec succès à:', candidate.email);
      } else {
        console.error('❌ Échec de l\'envoi de l\'email, mais le code a été généré');
        // En développement, on peut toujours retourner le code même si l'email échoue
        const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          console.log('⚠️ Mode développement: le code est retourné malgré l\'échec de l\'email');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('📧 CODE DE RÉINITIALISATION (DEV - Email échoué)');
          console.log('📧 Email:', candidate.email);
          console.log('🔐 CODE:', resetCode);
          console.log('⏰ Expire dans 15 minutes');
          console.log('═══════════════════════════════════════════════════════════');
          return {
            success: true,
            message: 'Code généré mais l\'envoi d\'email a échoué. Vérifiez la configuration Gmail.',
            resetCode,
          };
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
      // En développement, on peut toujours retourner le code même si l'email échoue
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        console.log('⚠️ Mode développement: le code est retourné malgré l\'erreur d\'email');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📧 CODE DE RÉINITIALISATION (DEV - Erreur email)');
        console.log('📧 Email:', candidate.email);
        console.log('🔐 CODE:', resetCode);
        console.log('⏰ Expire dans 15 minutes');
        console.log('═══════════════════════════════════════════════════════════');
        return {
          success: true,
          message: 'Code généré mais l\'envoi d\'email a échoué. Vérifiez la configuration Gmail.',
          resetCode,
        };
      }
    }
    
    return {
      success: true,
      message: 'Si cet email existe dans notre système, vous recevrez un code de réinitialisation.',
    };
  }

  async oauthLogin(user: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    provider: 'google' | 'facebook' | 'linkedin';
    providerId: string;
  }) {
    console.log('🔐 Tentative de connexion OAuth:', { email: user.email, provider: user.provider });

    // Chercher un candidat existant avec cet email
    const candidate = await this.supabase.findCandidateByEmail(user.email);

    if (candidate) {
      // Candidat existe déjà, connecter
      console.log('✅ Candidat existant trouvé, connexion OAuth:', candidate.id);
      
      if (!candidate.isActive) {
        throw new UnauthorizedException('Compte désactivé');
      }

      const { passwordHash: _, ...result } = candidate;
      return {
        ...result,
        accessToken: this.jwtService.sign({ sub: candidate.id, email: candidate.email }),
        isNewUser: false,
        needsRegistration: false,
      };
    } else {
      // Candidat n'existe pas, rediriger vers la page d'inscription
      console.log('📝 Candidat non trouvé, redirection vers la page d\'inscription:', user.email);
      
      return {
        needsRegistration: true,
        oauthData: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          provider: user.provider,
          providerId: user.providerId,
          picture: user.picture,
        },
      };
    }
  }

  async resetPassword(email: string, resetCode: string, newPassword: string) {
    console.log('🔐 Tentative de réinitialisation de mot de passe:', { email, resetCode: '****' });
    
    // Vérifier si le candidat existe
    const candidate = await this.supabase.findCandidateByEmail(email);
    
    if (!candidate) {
      throw new UnauthorizedException('Email non trouvé');
    }

    if (!candidate.passwordHash) {
      throw new UnauthorizedException('Ce compte n\'a pas de mot de passe. Veuillez créer un compte via l\'inscription.');
    }

    // Vérifier le code de réinitialisation
    const { data: tokenData, error: tokenError } = await this.supabase.getClient()
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('reset_code', resetCode)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ Code de réinitialisation invalide ou expiré:', {
        error: tokenError?.message,
        hasToken: !!tokenData,
      });
      throw new UnauthorizedException('Code de réinitialisation invalide ou expiré');
    }

    console.log('✅ Code de réinitialisation valide:', {
      email,
      tokenId: tokenData.id,
    });

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe du candidat
    const { error: updateError } = await this.supabase.getClient()
      .from('candidates')
      .update({ password_hash: newPasswordHash })
      .eq('id', candidate.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe:', updateError);
      throw new Error('Erreur lors de la réinitialisation du mot de passe');
    }

    // Marquer le code comme utilisé
    await this.supabase.getClient()
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    console.log('✅ Mot de passe réinitialisé avec succès pour:', email);

    return {
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    };
  }

  async adminChangePassword(adminId: string, currentPassword: string, newPassword: string) {
    console.log('🔐 Tentative de changement de mot de passe admin:', { adminId });
    
    // Récupérer l'admin
    const admin = await this.supabase.findAdminById(adminId);

    if (!admin) {
      console.error('❌ Admin non trouvé:', adminId);
      throw new UnauthorizedException('Admin non trouvé');
    }

    console.log('✅ Admin trouvé:', { id: admin.id, email: admin.email });

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);

    if (!isPasswordValid) {
      console.error('❌ Mot de passe actuel incorrect');
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    console.log('✅ Mot de passe actuel validé');

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    console.log('🔐 Nouveau mot de passe hashé, mise à jour en cours...');

    // Mettre à jour le mot de passe avec updated_at
    const { data, error: updateError } = await this.supabase.getClient()
      .from('admins')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId)
      .select();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe admin:', updateError);
      throw new Error(`Erreur lors de la mise à jour du mot de passe: ${updateError.message}`);
    }

    if (!data || data.length === 0) {
      console.error('❌ Aucune ligne mise à jour');
      throw new Error('Aucune ligne mise à jour dans la base de données');
    }

    console.log('✅ Mot de passe admin mis à jour avec succès:', { adminId, email: admin.email });

    return {
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    };
  }

  async changePassword(candidateId: string, currentPassword: string, newPassword: string) {
    console.log('🔐 Tentative de changement de mot de passe candidat:', { candidateId });
    
    // Récupérer le candidat
    const candidate = await this.supabase.findCandidateById(candidateId);

    if (!candidate) {
      console.error('❌ Candidat non trouvé:', candidateId);
      throw new UnauthorizedException('Candidat non trouvé');
    }

    if (!candidate.passwordHash) {
      console.error('❌ Le candidat n\'a pas de mot de passe défini');
      throw new BadRequestException('Ce compte n\'a pas de mot de passe. Veuillez utiliser la réinitialisation de mot de passe.');
    }

    console.log('✅ Candidat trouvé:', { id: candidate.id, email: candidate.email });

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, candidate.passwordHash);

    if (!isPasswordValid) {
      console.error('❌ Mot de passe actuel incorrect');
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    console.log('✅ Mot de passe actuel validé');

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    console.log('🔐 Nouveau mot de passe hashé, mise à jour en cours...');

    // Mettre à jour le mot de passe avec updated_at
    const { data, error: updateError } = await this.supabase.getClient()
      .from('candidates')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', candidateId)
      .select();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe candidat:', updateError);
      throw new Error(`Erreur lors de la mise à jour du mot de passe: ${updateError.message}`);
    }

    if (!data || data.length === 0) {
      console.error('❌ Aucune ligne mise à jour');
      throw new Error('Aucune ligne mise à jour dans la base de données');
    }

    console.log('✅ Mot de passe candidat mis à jour avec succès:', { candidateId, email: candidate.email });

    return {
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    };
  }

  async adminForgotPassword(email: string) {
    console.log('🔐 Tentative de réinitialisation de mot de passe admin:', { email });
    
    // Vérifier si l'admin existe
    const admin = await this.supabase.findAdminByEmail(email);
    
    if (!admin) {
      // Ne pas révéler que l'email n'existe pas (sécurité)
      console.log('⚠️ Email admin non trouvé (ne pas révéler à l\'utilisateur)');
      return {
        success: true,
        message: 'Si cet email existe dans notre système, vous recevrez un code de réinitialisation.',
      };
    }

    // Générer un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Le code expire dans 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Sauvegarder le code dans la base de données
    console.log('💾 Tentative de sauvegarde du code admin dans Supabase...');
    const { data, error } = await this.supabase.getClient()
      .from('password_reset_tokens')
      .insert({
        admin_id: admin.id,
        email: admin.email,
        reset_code: resetCode,
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la sauvegarde du code de réinitialisation admin:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      // Même en cas d'erreur, on retourne le code en développement pour permettre les tests
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        console.log('⚠️ Erreur Supabase, mais on retourne le code quand même en DEV');
        return {
          success: true,
          message: 'Code généré (mais erreur lors de la sauvegarde - vérifiez Supabase)',
          resetCode,
        };
      }
      
      throw new Error('Erreur lors de la génération du code de réinitialisation');
    }
    
    console.log('✅ Code admin sauvegardé dans Supabase:', data);

    console.log('✅ Code de réinitialisation admin généré:', {
      email: admin.email,
      resetCode,
      expiresAt: expiresAt.toISOString(),
    });

    // TODO: Envoyer l'email avec le code
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📧 CODE DE RÉINITIALISATION ADMIN (DEV ONLY)');
    console.log('📧 Email:', admin.email);
    console.log('🔐 CODE:', resetCode);
    console.log('⏰ Expire dans 15 minutes');
    console.log('═══════════════════════════════════════════════════════════');

    // Retourner le code dans la réponse (pour développement, avant implémentation de l'envoi d'email)
    // En production, le code sera envoyé par email
    const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    
    return {
      success: true,
      message: isDevelopment 
        ? 'Code généré. Vérifiez la console ou le toast pour le voir.' 
        : 'Si cet email existe dans notre système, vous recevrez un code de réinitialisation.',
      resetCode, // Toujours retourner le code tant que l'envoi d'email n'est pas implémenté
    };
  }

  async adminResetPassword(email: string, resetCode: string, newPassword: string) {
    console.log('🔐 Tentative de réinitialisation de mot de passe admin:', { email, resetCode: '****' });
    
    // Vérifier si l'admin existe
    const admin = await this.supabase.findAdminByEmail(email);
    
    if (!admin) {
      throw new UnauthorizedException('Aucun compte admin trouvé avec cet email');
    }

    // Vérifier le code de réinitialisation
    const { data: tokenData, error: tokenError } = await this.supabase.getClient()
      .from('password_reset_tokens')
      .select('*')
      .eq('admin_id', admin.id)
      .eq('reset_code', resetCode)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ Code de réinitialisation invalide ou expiré');
      throw new UnauthorizedException('Code de réinitialisation invalide ou expiré');
    }

    // Vérifier si le code a expiré
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      console.error('❌ Code de réinitialisation expiré');
      throw new UnauthorizedException('Code de réinitialisation expiré');
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    const { error: updateError } = await this.supabase.getClient()
      .from('admins')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', admin.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe admin:', updateError);
      throw new Error('Erreur lors de la mise à jour du mot de passe');
    }

    // Marquer le code comme utilisé
    await this.supabase.getClient()
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    console.log('✅ Mot de passe admin réinitialisé avec succès');

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    };
  }
}
