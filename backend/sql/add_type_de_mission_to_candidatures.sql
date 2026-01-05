-- ============================================
-- Script pour ajouter le champ type_de_mission
-- à la table candidatures (si elle existe déjà)
-- ============================================

-- Enum pour le type de mission (si pas déjà créé)
DO $$ 
BEGIN 
  CREATE TYPE mission_type AS ENUM ('CDI', 'CDD', 'stage', 'freelance', 'autre');
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- Ajouter la colonne type_de_mission si elle n'existe pas
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidatures' AND column_name = 'type_de_mission'
  ) THEN
    ALTER TABLE candidatures ADD COLUMN type_de_mission mission_type;
  END IF;
END $$;






