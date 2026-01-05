-- ============================================
-- Tables Catégories et Candidatures
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Enum pour le statut de candidature
DO $$ 
BEGIN 
  CREATE TYPE candidature_status AS ENUM ('en_attente', 'en_cours', 'accepte', 'refuse', 'archive');
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- Enum pour le type de mission
DO $$ 
BEGIN 
  CREATE TYPE mission_type AS ENUM ('CDI', 'CDD', 'stage', 'freelance', 'autre');
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Table catégories (les 4 services)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table candidatures
-- ============================================
CREATE TABLE IF NOT EXISTS candidatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  categorie_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  cv_path VARCHAR(500) NOT NULL,
  type_de_mission mission_type,
  date_postulation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  statut candidature_status NOT NULL DEFAULT 'en_attente',
  sent_to_crm BOOLEAN NOT NULL DEFAULT FALSE,
  crm_sync_status crm_sync_status NOT NULL DEFAULT 'pending',
  crm_sync_date TIMESTAMPTZ,
  crm_sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Contrainte unique : un candidat ne peut postuler qu'une fois par catégorie
  UNIQUE(candidate_id, categorie_id)
);

-- ============================================
-- Index pour améliorer les performances
-- ============================================
CREATE INDEX IF NOT EXISTS idx_candidatures_candidate ON candidatures (candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_categorie ON candidatures (categorie_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures (statut);
CREATE INDEX IF NOT EXISTS idx_candidatures_date_postulation ON candidatures (date_postulation DESC);

-- ============================================
-- Insertion des 4 catégories (services)
-- ============================================
INSERT INTO categories (nom, description) VALUES
  ('Cybersécurité', 'Protection des systèmes, des réseaux et des données contre les cybermenaces, audits de sécurité et gestion des risques.'),
  ('Intelligence Artificielle', 'Développement de solutions IA, automatisation, analyse de données et intégration de modèles intelligents.'),
  ('Réseaux & Télécom', 'Conception, déploiement et maintenance des infrastructures réseaux et télécoms pour les entreprises.'),
  ('Conseil & Expertise IT', 'Accompagnement stratégique, audit IT et optimisation des systèmes d''information.')
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- Trigger pour mettre à jour updated_at automatiquement
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les triggers s'ils existent déjà, puis les recréer
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidatures_updated_at ON candidatures;
CREATE TRIGGER update_candidatures_updated_at
  BEFORE UPDATE ON candidatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

