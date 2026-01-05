-- ============================================
-- Ajouter les champs à la table candidates
-- ============================================
-- 
-- Instructions:
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez-collez ce script
-- 3. Exécutez le script
-- ============================================

-- Ajouter le champ type_de_mission_souhaite
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' 
    AND column_name = 'type_de_mission_souhaite'
  ) THEN
    ALTER TABLE candidates 
    ADD COLUMN type_de_mission_souhaite VARCHAR(50);
    
    RAISE NOTICE '✅ Colonne type_de_mission_souhaite ajoutée à la table candidates';
  ELSE
    RAISE NOTICE 'ℹ️  La colonne type_de_mission_souhaite existe déjà';
  END IF;
END $$;

-- Ajouter le champ categorie_principale_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' 
    AND column_name = 'categorie_principale_id'
  ) THEN
    ALTER TABLE candidates 
    ADD COLUMN categorie_principale_id UUID;
    
    -- Ajouter la contrainte de clé étrangère vers categories
    ALTER TABLE candidates
    ADD CONSTRAINT fk_candidates_categorie_principale
    FOREIGN KEY (categorie_principale_id)
    REFERENCES categories(id)
    ON DELETE SET NULL;
    
    RAISE NOTICE '✅ Colonne categorie_principale_id ajoutée à la table candidates avec FK vers categories';
  ELSE
    RAISE NOTICE 'ℹ️  La colonne categorie_principale_id existe déjà';
  END IF;
END $$;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_candidates_categorie_principale_id 
ON candidates(categorie_principale_id);

-- Vérification
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'candidates'
AND column_name IN ('type_de_mission_souhaite', 'categorie_principale_id')
ORDER BY column_name;





