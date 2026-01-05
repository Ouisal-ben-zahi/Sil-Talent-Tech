-- ============================================
-- Créer la table photo_history
-- ============================================
-- 
-- Instructions:
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez-collez ce script
-- 3. Exécutez le script
-- ============================================

-- Table: photo_history
-- Relation : Chaque photo est liée à un candidat via candidate_id (Foreign Key)
-- Cascade : Si un candidat est supprimé, toutes ses photos sont supprimées automatiquement
CREATE TABLE IF NOT EXISTS photo_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL, -- Chemin dans Supabase Storage (ex: "abc123_1234567890_photo.jpg")
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
DO $$ BEGIN
  ALTER TABLE photo_history
  ADD CONSTRAINT fk_photo_history_candidate 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_photo_history_candidate_id ON photo_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_photo_history_uploaded_at ON photo_history(uploaded_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement (si nécessaire)
-- Note: photo_history n'a pas de colonne updated_at pour l'instant

-- Activer RLS (Row Level Security) si nécessaire
-- ALTER TABLE photo_history ENABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'photo_history'
ORDER BY ordinal_position;





