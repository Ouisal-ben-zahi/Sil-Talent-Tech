-- ============================================
-- Ajouter la Contrainte de Relation Candidat-CV
-- ============================================
-- 
-- Ce script garantit que la relation entre cv_history et candidates
-- est bien définie avec une contrainte de clé étrangère explicite
-- ============================================

-- Vérifier si la contrainte existe déjà
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe (sans nom)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'cv_history' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%candidate%'
  ) THEN
    -- Supprimer les contraintes existantes sans nom explicite
    ALTER TABLE cv_history 
    DROP CONSTRAINT IF EXISTS cv_history_candidate_id_fkey;
  END IF;

  -- Ajouter la contrainte avec un nom explicite
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'cv_history' 
    AND constraint_name = 'fk_cv_history_candidate'
  ) THEN
    ALTER TABLE cv_history
    ADD CONSTRAINT fk_cv_history_candidate 
    FOREIGN KEY (candidate_id) 
    REFERENCES candidates(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Contrainte de relation ajoutée : cv_history.candidate_id → candidates.id';
  ELSE
    RAISE NOTICE 'ℹ️  La contrainte fk_cv_history_candidate existe déjà';
  END IF;
END $$;

-- Vérifier que tous les CV ont un candidate_id valide
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM cv_history cv
  LEFT JOIN candidates c ON cv.candidate_id = c.id
  WHERE c.id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE WARNING '⚠️  % CV orphelin(s) trouvé(s) (sans candidat valide)', orphan_count;
  ELSE
    RAISE NOTICE '✅ Tous les CV sont liés à un candidat valide';
  END IF;
END $$;

-- Afficher un résumé des relations
SELECT 
  'Résumé des Relations' as titre,
  (SELECT COUNT(*) FROM candidates) as total_candidats,
  (SELECT COUNT(*) FROM cv_history) as total_cv,
  (SELECT COUNT(DISTINCT candidate_id) FROM cv_history) as candidats_avec_cv,
  (SELECT COUNT(*) FROM cv_history cv 
   LEFT JOIN candidates c ON cv.candidate_id = c.id 
   WHERE c.id IS NULL) as cv_orphelins;

-- ============================================
-- ✅ Relation Vérifiée et Garantie!
-- ============================================
-- 
-- La contrainte FOREIGN KEY garantit que :
-- ✅ Chaque CV est lié à un candidat existant
-- ✅ Impossible d'insérer un CV sans candidat valide
-- ✅ Suppression en cascade (supprimer candidat → supprime ses CV)
-- ============================================
