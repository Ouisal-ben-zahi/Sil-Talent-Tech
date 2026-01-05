-- ============================================
-- Schéma Supabase pour Sil Talents Tech (Version Idempotente)
-- ============================================
-- 
-- Cette version peut être exécutée plusieurs fois sans erreur
-- même si les éléments existent déjà
-- 
-- Instructions:
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez-collez ce script
-- 3. Exécutez le script (peut être exécuté plusieurs fois)
-- ============================================

-- Enum: ExpertiseLevel
DO $$ BEGIN
  CREATE TYPE expertise_level AS ENUM ('junior', 'confirme', 'senior', 'expert');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum: ApplicationSource
DO $$ BEGIN
  CREATE TYPE application_source AS ENUM ('portal_registration', 'quick_application');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum: CrmSyncStatus
DO $$ BEGIN
  CREATE TYPE crm_sync_status AS ENUM ('pending', 'synced', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum: AdminRole
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('super_admin', 'consultant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table: candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  password_hash TEXT,
  linkedin VARCHAR(500),
  portfolio VARCHAR(500),
  job_title VARCHAR(255),
  expertise_level expertise_level,
  country VARCHAR(100),
  city VARCHAR(100),
  source application_source NOT NULL DEFAULT 'quick_application',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table: cv_history
-- Relation : Chaque CV est lié à un candidat via candidate_id (Foreign Key)
-- Cascade : Si un candidat est supprimé, tous ses CV sont supprimés automatiquement
CREATE TABLE IF NOT EXISTS cv_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL, -- Chemin dans Supabase Storage (ex: "abc123_1234567890_CV.pdf")
  file_size BIGINT NOT NULL,
  crm_sync_status crm_sync_status NOT NULL DEFAULT 'pending',
  crm_sync_date TIMESTAMP WITH TIME ZONE,
  crm_sync_error TEXT,
  crm_sync_retry_count INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
DO $$ BEGIN
  ALTER TABLE cv_history
  ADD CONSTRAINT fk_cv_history_candidate 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table: admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role admin_role NOT NULL DEFAULT 'consultant',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_is_active ON candidates(is_active);

-- Index sur candidate_id pour améliorer les jointures et récupérations de CV par candidat
CREATE INDEX IF NOT EXISTS idx_cv_history_candidate_id ON cv_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_cv_history_sync_status ON cv_history(crm_sync_status);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- 
-- Note: RLS est activé mais avec des politiques permissives
-- car l'authentification est gérée au niveau du site web (NestJS + JWT)
-- ============================================

-- Activer RLS sur les tables
DO $$ BEGIN
  ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE cv_history ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN null;
END $$;

-- Politiques pour candidates
DO $$ BEGIN
  CREATE POLICY "Allow all operations for service role"
    ON candidates
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Politiques pour cv_history
DO $$ BEGIN
  CREATE POLICY "Allow all operations for service role"
    ON cv_history
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Politiques pour admins
DO $$ BEGIN
  CREATE POLICY "Allow all operations for service role"
    ON admins
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- ✅ Schéma créé/mis à jour avec succès!
-- ============================================
-- 
-- Ce script peut être exécuté plusieurs fois sans erreur.
-- Tous les éléments sont créés seulement s'ils n'existent pas déjà.
-- ============================================
