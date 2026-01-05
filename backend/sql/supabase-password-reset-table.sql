-- ============================================
-- Table pour les codes de réinitialisation de mot de passe
-- ============================================
-- 
-- Instructions:
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez-collez ce script
-- 3. Exécutez le script
-- ============================================

-- Table: password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  reset_code VARCHAR(6) NOT NULL, -- Code à 6 chiffres
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Contrainte de clé étrangère
  CONSTRAINT fk_password_reset_candidate 
    FOREIGN KEY (candidate_id) 
    REFERENCES candidates(id) 
    ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset_tokens(reset_code);
CREATE INDEX IF NOT EXISTS idx_password_reset_candidate_id ON password_reset_tokens(candidate_id);

-- Index pour les requêtes de nettoyage (codes expirés)
CREATE INDEX IF NOT EXISTS idx_password_reset_expires_at ON password_reset_tokens(expires_at);

-- RLS (Row Level Security) - Permettre l'insertion pour le service_role
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Permettre l'insertion pour le service_role
CREATE POLICY "Service role can insert password reset tokens"
  ON password_reset_tokens
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Permettre la lecture pour le service_role
CREATE POLICY "Service role can read password reset tokens"
  ON password_reset_tokens
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Permettre la mise à jour pour le service_role
CREATE POLICY "Service role can update password reset tokens"
  ON password_reset_tokens
  FOR UPDATE
  TO service_role
  USING (true);

-- Fonction pour nettoyer automatiquement les codes expirés (optionnel)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() AND used = false;
END;
$$ LANGUAGE plpgsql;




