import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore - pdf-parse n'a pas de types TypeScript officiels
import pdfParse from 'pdf-parse';
// @ts-ignore - mammoth n'a pas de types TypeScript officiels
import mammoth from 'mammoth';
// @ts-ignore - file-type n'a pas de types TypeScript officiels complets
import { fileTypeFromBuffer } from 'file-type';

interface CvValidationResult {
  isValid: boolean;
  score: number;
  reasons: string[];
}

@Injectable()
export class CvValidationService {
  private readonly logger = new Logger(CvValidationService.name);
  private readonly MIN_CONFIDENCE_SCORE = 0.5; // Score minimum pour accepter le CV (50% - strict)
  private readonly MIN_TEXT_LENGTH = 200; // Longueur minimale de texte pour un CV valide (strict)

  /**
   * Valide qu'un fichier est un vrai CV
   * @param file Fichier à valider
   * @returns Résultat de validation avec score et raisons
   */
  async validateCv(file: Express.Multer.File): Promise<CvValidationResult> {
    this.logger.log(`🔍 Début de la validation du CV: ${file.originalname}`);

    // 1. Vérifier le type MIME réel (pas seulement l'extension)
    const mimeValidation = await this.validateMimeType(file);
    if (!mimeValidation.isValid) {
      this.logger.warn(`❌ Type MIME invalide: ${file.mimetype}`);
      return {
        isValid: false,
        score: 0,
        reasons: [mimeValidation.reason],
      };
    }

    // 2. Vérifier que le fichier n'est pas vide ou corrompu
    if (file.size === 0) {
      this.logger.warn('❌ Fichier vide');
      return {
        isValid: false,
        score: 0,
        reasons: ['Le fichier est vide'],
      };
    }

    // 3. Extraire le texte du fichier
    let extractedText: string = '';
    let extractionFailed = false;
    let extractionError: string | null = null;
    
    try {
      extractedText = await this.extractText(file);
      // Nettoyer le texte
      extractedText = this.cleanText(extractedText);
      this.logger.log(`📄 Texte extrait: ${extractedText.length} caractères`);
      if (extractedText.length > 0) {
        this.logger.log(`📄 Aperçu du texte (100 premiers caractères): ${extractedText.substring(0, 100)}`);
      } else {
        this.logger.warn(`⚠️ Aucun texte extrait du fichier - peut être un PDF scanné (image)`);
        extractionFailed = true;
        extractionError = 'Le fichier PDF semble être une image scannée. Veuillez utiliser un PDF avec du texte sélectionnable.';
      }
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de l'extraction du texte: ${error.message}`);
      this.logger.error(`❌ Stack trace: ${error.stack}`);
      extractionFailed = true;
      extractionError = error.message || 'Erreur inconnue lors de l\'extraction';
      
      // Si c'est un PDF et que l'extraction échoue, c'est peut-être un PDF scanné
      if (file.mimetype === 'application/pdf') {
        extractionError = 'Le PDF semble être une image scannée ou protégé. Veuillez utiliser un PDF avec du texte sélectionnable (non scanné).';
      }
    }

    // 4. Si l'extraction a échoué, vérifier si c'est un PDF scanné valide
    if (extractionFailed || extractedText.length < this.MIN_TEXT_LENGTH) {
      this.logger.warn(`⚠️ Extraction échouée ou texte trop court: ${extractedText.length} caractères`);
      
      // Validation de secours pour PDF scannés : accepter si le fichier a une taille raisonnable
      // Un CV scanné valide fait généralement entre 50KB et 5MB
      if (file.mimetype === 'application/pdf') {
        const fileSizeMB = file.size / (1024 * 1024);
        const fileSizeKB = file.size / 1024;
        const isValidSize = fileSizeKB >= 50 && fileSizeMB <= 5; // Entre 50KB et 5MB
        
        this.logger.log(`📊 PDF scanné détecté - Taille: ${fileSizeKB.toFixed(2)} KB (${fileSizeMB.toFixed(2)} MB)`);
        this.logger.log(`📊 Validation taille: ${isValidSize ? '✅ Valide' : '❌ Invalide'}`);
        
        if (isValidSize) {
          this.logger.log(`✅ PDF scanné détecté - Validation de secours: Fichier PDF valide (${fileSizeKB.toFixed(2)} KB)`);
          // Donner un score minimal pour les PDF scannés valides
          // Score de 50% pour passer la validation (taille + type valide)
          const fallbackScore = 0.5;
          return {
            isValid: true, // Toujours valide si la taille est correcte
            score: fallbackScore,
            reasons: [
              'PDF scanné détecté (image) - Texte non extractible',
              `Fichier PDF valide (${fileSizeKB.toFixed(2)} KB)`,
              'Accepté via validation de secours pour PDF scanné',
              '⚠️ Pour une meilleure analyse, utilisez un PDF avec du texte sélectionnable si possible'
            ],
          };
        } else {
          // Taille invalide même pour un PDF scanné
          this.logger.warn(`❌ PDF scanné rejeté - Taille invalide: ${fileSizeKB.toFixed(2)} KB`);
          return {
            isValid: false,
            score: 0,
            reasons: [
              extractionError || 'PDF scanné détecté mais taille invalide',
              `Taille du fichier: ${fileSizeKB.toFixed(2)} KB (attendu: entre 50KB et 5MB)`,
              'Veuillez utiliser un PDF valide de taille raisonnable.'
            ],
          };
        }
      } else {
        // Pour les fichiers Word, on ne peut pas accepter sans texte
        return {
          isValid: false,
          score: 0,
          reasons: [
            extractionError || 'Impossible d\'extraire le texte du fichier Word',
            extractedText.length < this.MIN_TEXT_LENGTH 
              ? `Texte trop court (${extractedText.length} caractères, minimum requis: ${this.MIN_TEXT_LENGTH})` 
              : 'Aucun texte extractible',
            'Les fichiers Word doivent contenir du texte sélectionnable.',
            'Veuillez utiliser un CV au format Word avec du texte sélectionnable contenant des sections typiques (expérience, formation, compétences, etc.).'
          ].filter(Boolean),
        };
      }
    }

    // 5. Analyser le contenu pour détecter des sections typiques d'un CV
    const analysisResult = this.analyzeContent(extractedText);
    this.logger.log(`📊 Score de confiance: ${analysisResult.score.toFixed(2)}`);
    this.logger.log(`📊 Raisons: ${analysisResult.reasons.join(', ')}`);

    // 6. Décision finale - Exiger score >= 50% ET au moins 2 sections détectées
    const sectionsDetected = analysisResult.reasons.filter(r => r.includes('Section "')).length;
    const hasMinimumSections = sectionsDetected >= 2;
    const hasMinimumScore = analysisResult.score >= this.MIN_CONFIDENCE_SCORE;
    const isValid = hasMinimumScore && hasMinimumSections;

    if (!isValid) {
      if (!hasMinimumSections) {
        analysisResult.reasons.push(`❌ Seulement ${sectionsDetected} section(s) détectée(s), minimum requis: 2`);
      }
      if (!hasMinimumScore) {
        this.logger.warn(`❌ CV rejeté - Score: ${analysisResult.score.toFixed(2)} < ${this.MIN_CONFIDENCE_SCORE}`);
      } else {
        this.logger.warn(`❌ CV rejeté - Sections insuffisantes: ${sectionsDetected} < 2`);
      }
    } else {
      this.logger.log(`✅ CV accepté - Score: ${analysisResult.score.toFixed(2)}, Sections: ${sectionsDetected}`);
    }

    return {
      isValid,
      score: analysisResult.score,
      reasons: analysisResult.reasons,
    };
  }

  /**
   * Valide le type MIME réel du fichier
   */
  private async validateMimeType(file: Express.Multer.File): Promise<{ isValid: boolean; reason?: string }> {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];

    // Vérifier le type MIME déclaré
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        reason: `Type de fichier non autorisé: ${file.mimetype}. Formats acceptés: PDF, Word (.doc, .docx)`,
      };
    }

    // Vérifier le type MIME réel en analysant les premiers octets
    try {
      const fileTypeResult = await fileTypeFromBuffer(file.buffer);
      if (fileTypeResult) {
        const realMimeType = fileTypeResult.mime;
        
        // Mapper les types détectés aux types autorisés
        const mimeTypeMap: Record<string, string[]> = {
          'application/pdf': ['application/pdf'],
          'application/msword': ['application/msword'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip', // Les .docx sont techniquement des ZIP
          ],
        };

        const declaredType = file.mimetype;
        const allowedRealTypes = mimeTypeMap[declaredType] || [];

        // Pour les .docx, accepter aussi 'application/zip' car c'est leur format réel
        if (declaredType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          if (realMimeType === 'application/zip' || realMimeType === declaredType) {
            return { isValid: true };
          }
        } else {
          if (allowedRealTypes.includes(realMimeType) || realMimeType === declaredType) {
            return { isValid: true };
          }
        }

        // Si le type réel ne correspond pas, vérifier quand même si c'est un PDF
        if (realMimeType === 'application/pdf' && declaredType === 'application/pdf') {
          return { isValid: true };
        }

        this.logger.warn(`⚠️ Type MIME réel différent du déclaré: ${realMimeType} vs ${declaredType}`);
        // On accepte quand même si le type déclaré est valide (certains fichiers peuvent avoir des headers différents)
        return { isValid: true };
      }
    } catch (error: any) {
      this.logger.warn(`⚠️ Impossible de détecter le type MIME réel: ${error.message}`);
      // Si on ne peut pas détecter le type réel, on fait confiance au type déclaré
    }

    return { isValid: true };
  }

  /**
   * Extrait le texte d'un fichier PDF ou Word
   */
  private async extractText(file: Express.Multer.File): Promise<string> {
    if (file.mimetype === 'application/pdf') {
      return this.extractTextFromPdf(file.buffer);
    } else if (
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.extractTextFromWord(file.buffer);
    } else {
      throw new Error(`Type de fichier non supporté pour l'extraction: ${file.mimetype}`);
    }
  }

  /**
   * Extrait le texte d'un PDF
   */
  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      // pdf-parse peut être importé différemment selon la version
      const parseFunction = (pdfParse as any).default || pdfParse;
      const data = await parseFunction(buffer);
      
      const extractedText = data.text || '';
      
      // Vérifier si le texte extrait est vraiment vide ou contient très peu de caractères
      if (extractedText.trim().length === 0) {
        this.logger.warn('⚠️ PDF extrait mais texte vide - peut être un PDF scanné (image)');
        throw new Error('PDF scanné détecté - aucun texte extractible');
      }
      
      return extractedText;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'extraction PDF: ${error.message}`);
      this.logger.error(`Type d'erreur: ${error.constructor.name}`);
      
      // Relancer l'erreur avec plus de détails
      if (error.message.includes('scanné')) {
        throw error; // Garder le message spécifique
      } else {
        throw new Error(`Impossible d'extraire le texte du PDF: ${error.message}`);
      }
    }
  }

  /**
   * Extrait le texte d'un fichier Word
   */
  private async extractTextFromWord(buffer: Buffer): Promise<string> {
    try {
      // mammoth peut être importé différemment selon la version
      const mammothModule = (mammoth as any).default || mammoth;
      const result = await mammothModule.extractRawText({ buffer });
      return result.value || '';
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'extraction Word: ${error.message}`);
      throw new Error('Impossible d\'extraire le texte du fichier Word');
    }
  }

  /**
   * Analyse le contenu pour détecter des sections typiques d'un CV
   */
  private analyzeContent(text: string): { score: number; reasons: string[] } {
    const normalizedText = text.toLowerCase().trim();
    const reasons: string[] = [];
    let score = 0;

    // Mots-clés typiques d'un CV (français et anglais) - Élargi pour mieux détecter les CV
    const cvKeywords = {
      // Sections principales
      experience: ['expérience', 'experience', 'expériences', 'experiences', 'parcours professionnel', 'professional experience', 'work experience', 'emploi', 'emplois', 'jobs', 'poste', 'postes', 'position', 'positions', 'travail', 'work', 'carrière', 'career', 'professionnel', 'professional', 'activité', 'activity', 'fonction', 'function', 'rôle', 'role'],
      education: ['formation', 'education', 'études', 'studies', 'diplôme', 'diploma', 'diplômes', 'diplomas', 'université', 'university', 'école', 'school', 'baccalauréat', 'bac', 'master', 'licence', 'bachelor', 'doctorat', 'phd', 'ingénieur', 'engineer', 'certificat', 'certificate', 'qualification', 'qualification'],
      skills: ['compétences', 'skills', 'compétence', 'skill', 'aptitudes', 'aptitudes', 'technologies', 'technologies', 'langages', 'languages', 'outils', 'tools', 'maîtrise', 'mastery', 'savoir-faire', 'know-how', 'expertise', 'expertise', 'capacités', 'capabilities', 'talents', 'talents'],
      profile: ['profil', 'profile', 'à propos', 'about', 'résumé', 'summary', 'présentation', 'presentation', 'objectif', 'objective', 'objectifs', 'objectives', 'description', 'description', 'introduction', 'introduction'],
      contact: ['téléphone', 'phone', 'email', 'mail', 'adresse', 'address', 'contact', 'coordonnées', 'coordinates', 'tél', 'tel', 'mobile', 'portable', 'fixe', 'landline', '@', 'gmail', 'yahoo', 'hotmail', 'outlook'],
      languages: ['langues', 'languages', 'langue', 'language', 'français', 'french', 'anglais', 'english', 'arabe', 'arabic', 'espagnol', 'spanish', 'allemand', 'german', 'italien', 'italian'],
    };

    // Détecter les sections
    let foundSections = 0;
    const totalSections = Object.keys(cvKeywords).length;

    for (const [section, keywords] of Object.entries(cvKeywords)) {
      const found = keywords.some((keyword) => normalizedText.includes(keyword));
      if (found) {
        foundSections++;
        reasons.push(`Section "${section}" détectée`);
      }
    }

    // Score basé sur les sections trouvées (40% du score total - strict)
    // Exiger au moins 2 sections pour un CV valide
    const sectionScore = (foundSections / totalSections) * 0.4;
    if (foundSections >= 2) {
      score += sectionScore + 0.1; // Bonus de 10% si au moins 2 sections
    } else if (foundSections === 1) {
      score += sectionScore * 0.5; // Réduire le score si seulement 1 section
    }
    // Si aucune section n'est trouvée, score = 0 pour cette partie

    // Détecter des dates ou périodes (ex: 2019 – 2024, 2020-2023, etc.)
    const datePatterns = [
      /\d{4}\s*[-–—]\s*\d{4}/g, // 2019-2024, 2019 – 2024
      /\d{4}\s*à\s*\d{4}/g, // 2019 à 2024
      /\d{4}\s*to\s*\d{4}/g, // 2019 to 2024
      /\d{1,2}\/\d{4}\s*[-–—]\s*\d{1,2}\/\d{4}/g, // 01/2019 - 12/2024
      /\d{1,2}\/\d{4}\s*à\s*\d{1,2}\/\d{4}/g, // 01/2019 à 12/2024
    ];

    let foundDates = 0;
    for (const pattern of datePatterns) {
      const matches = normalizedText.match(pattern);
      if (matches) {
        foundDates += matches.length;
      }
    }

    // Score basé sur les dates trouvées (15% du score total)
    // Ajouter aussi la détection d'années simples (ex: 2020, 2021, etc.)
    const yearPattern = /\b(19|20)\d{2}\b/g;
    const foundYears = (normalizedText.match(yearPattern) || []).length;
    const totalDateIndicators = foundDates + Math.min(foundYears, 10); // Limiter les années à 10
    
    const dateScore = Math.min(totalDateIndicators * 0.03, 0.15);
    score += dateScore;
    if (foundDates > 0 || foundYears > 0) {
      reasons.push(`${foundDates} période(s) et ${foundYears} année(s) détectée(s)`);
    }

    // Détecter des mots-clés professionnels courants
    const professionalKeywords = [
      'développeur', 'developer', 'ingénieur', 'engineer', 'consultant', 'consultant',
      'manager', 'chef de projet', 'project manager', 'analyste', 'analyst',
      'architecte', 'architect', 'spécialiste', 'specialist', 'expert', 'expert',
      'technologies', 'technologies', 'projet', 'project', 'mission', 'mission',
      'entreprise', 'company', 'société', 'society', 'client', 'client',
      'équipe', 'team', 'collaboration', 'collaboration', 'responsabilité', 'responsibility',
    ];

    let foundKeywords = 0;
    for (const keyword of professionalKeywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        foundKeywords++;
      }
    }

    // Score basé sur les mots-clés professionnels (15% du score total)
    // Réduire le seuil pour donner plus de points
    const keywordScore = Math.min(foundKeywords * 0.02, 0.15);
    score += keywordScore;
    if (foundKeywords > 3) {
      reasons.push(`${foundKeywords} mots-clés professionnels détectés`);
    }
    
    // Bonus si le texte contient des informations personnelles typiques d'un CV
    const personalInfoPatterns = [
      /\b\d{2}\/\d{2}\/\d{4}\b/g, // Dates de naissance
      /\b\+?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}\b/g, // Numéros de téléphone
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    ];
    
    let personalInfoCount = 0;
    for (const pattern of personalInfoPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        personalInfoCount += matches.length;
      }
    }
    
    if (personalInfoCount > 0) {
      score += Math.min(personalInfoCount * 0.05, 0.1); // Bonus jusqu'à 10%
      reasons.push(`Informations personnelles détectées (${personalInfoCount})`);
    }

    // Vérifier la longueur du texte (20% du score total - strict)
    // Un CV valide fait généralement entre 200 et 5000 caractères
    let lengthScore = 0;
    if (text.length >= 200 && text.length <= 5000) {
      lengthScore = 0.2; // Score maximal pour longueur normale
    } else if (text.length >= 100 && text.length < 200) {
      lengthScore = 0.1; // CV court mais acceptable
    } else if (text.length > 5000) {
      lengthScore = 0.15; // CV très long mais acceptable
    }
    // Les textes de moins de 100 caractères ne reçoivent aucun point

    score += lengthScore;
    if (lengthScore > 0) {
      reasons.push(`Longueur de texte appropriée (${text.length} caractères)`);
    }

    // Normaliser le score entre 0 et 1
    score = Math.min(Math.max(score, 0), 1);

    // Exiger au moins 2 sections typiques pour considérer comme CV valide
    if (foundSections < 2) {
      reasons.push(`⚠️ Seulement ${foundSections} section(s) détectée(s), minimum requis: 2`);
    }

    return {
      score,
      reasons: reasons.length > 0 ? reasons : ['Aucune section typique de CV détectée'],
    };
  }

  /**
   * Nettoie le texte extrait (supprime caractères inutiles)
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .replace(/\n{3,}/g, '\n\n') // Remplacer les retours à la ligne multiples
      .trim();
  }
}

