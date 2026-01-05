export const APP_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 Mo
  ALLOWED_FILE_TYPES: ['application/pdf'],
  JWT_EXPIRES_IN: '7d',
  CRM_MAX_RETRIES: 3,
  CRM_RETRY_DELAY_BASE: 1000, // 1 seconde (backoff exponentiel)
  PASSWORD_MIN_LENGTH: 8,
  RATE_LIMIT_TTL: 60000, // 1 minute
  RATE_LIMIT_MAX: 10, // 10 requêtes
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès interdit',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation',
  INTERNAL_ERROR: 'Erreur interne du serveur',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux',
  INVALID_FILE_TYPE: 'Type de fichier non autorisé',
  CRM_SYNC_FAILED: 'Échec de la synchronisation CRM',
} as const;

export const SUCCESS_MESSAGES = {
  CANDIDATE_CREATED: 'Candidat créé avec succès',
  CV_UPLOADED: 'CV uploadé avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
  CRM_SYNC_SUCCESS: 'Synchronisation CRM réussie',
} as const;

