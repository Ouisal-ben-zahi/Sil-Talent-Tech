-- ============================================
-- Mise à jour de la table password_reset_tokens pour supporter les admins
-- ============================================
-- 
-- Instructions:
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez-collez ce script
-- 3. Exécutez le script
-- ============================================

-- Rendre candidate_id nullable (pour permettre les admins)
ALTER TABLE password_reset_tokens 
  ALTER COLUMN candidate_id DROP NOT NULL;

-- Ajouter la colonne admin_id (nullable)
ALTER TABLE password_reset_tokens 
  ADD COLUMN IF NOT EXISTS admin_id UUID;

-- Ajouter la contrainte de clé étrangère pour admin_id
DO $$ BEGIN
  ALTER TABLE password_reset_tokens
  ADD CONSTRAINT fk_password_reset_admin 
    FOREIGN KEY (admin_id) 
    REFERENCES admins(id) 
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ajouter une contrainte pour s'assurer qu'au moins un des deux (candidate_id ou admin_id) est présent
ALTER TABLE password_reset_tokens
  ADD CONSTRAINT check_candidate_or_admin 
    CHECK (
      (candidate_id IS NOT NULL AND admin_id IS NULL) OR 
      (candidate_id IS NULL AND admin_id IS NOT NULL)
    );

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_password_reset_admin_id ON password_reset_tokens(admin_id);














