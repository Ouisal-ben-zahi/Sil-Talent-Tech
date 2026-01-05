// Types de base de données pour Supabase

export enum ExpertiseLevel {
  JUNIOR = 'junior',
  CONFIRME = 'confirme',
  SENIOR = 'senior',
  EXPERT = 'expert',
}

export enum ApplicationSource {
  PORTAL_REGISTRATION = 'portal_registration',
  QUICK_APPLICATION = 'quick_application',
  GOOGLE_OAUTH = 'google_oauth',
  FACEBOOK_OAUTH = 'facebook_oauth',
  LINKEDIN_OAUTH = 'linkedin_oauth',
}

export enum CrmSyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  CONSULTANT = 'consultant',
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string | null;
  linkedin: string | null;
  portfolio: string | null;
  jobTitle: string | null;
  expertiseLevel: ExpertiseLevel | null;
  country: string | null;
  city: string | null;
  typeDeMissionSouhaite: string | null;
  categoriePrincipaleId: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  educationLevel: string | null;
  professionalExperience: string | null;
  biography: string | null;
  source: ApplicationSource;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CvHistory {
  id: string;
  candidateId: string;
  fileName: string;
  filePath: string;
  fileSize: bigint | number;
  crmSyncStatus: CrmSyncStatus;
  crmSyncDate: Date | null;
  crmSyncError: string | null;
  crmSyncRetryCount: number;
  uploadedAt: Date;
}

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateWithCvHistory extends Candidate {
  cvHistories?: CvHistory[];
}

export enum CandidatureStatus {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  ACCEPTE = 'accepte',
  REFUSE = 'refuse',
  ARCHIVE = 'archive',
}

export enum MissionType {
  CDI = 'CDI',
  CDD = 'CDD',
  STAGE = 'stage',
  FREELANCE = 'freelance',
  AUTRE = 'autre',
}

export interface Categorie {
  id: string;
  nom: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidature {
  id: string;
  candidateId: string;
  categorieId: string;
  cvPath: string;
  typeDeMission: MissionType | null;
  datePostulation: Date;
  statut: CandidatureStatus;
  sentToCrm: boolean;
  crmSyncStatus: CrmSyncStatus;
  crmSyncDate: Date | null;
  crmSyncError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoHistory {
  id: string;
  candidateId: string;
  fileName: string;
  filePath: string;
  fileSize: bigint | number;
  uploadedAt: Date;
}

