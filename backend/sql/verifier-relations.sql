-- ============================================
-- Script de Vérification des Relations
-- ============================================
-- 
-- Ce script vérifie que les CV sont bien liés aux candidats
-- dans la base de données Supabase
-- ============================================

-- 1. Vérifier que la contrainte de clé étrangère existe
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'cv_history'
  AND ccu.table_name = 'candidates';

-- 2. Vérifier que tous les CV ont un candidate_id valide
SELECT 
  COUNT(*) as total_cv,
  COUNT(DISTINCT candidate_id) as candidats_avec_cv,
  COUNT(CASE WHEN candidate_id IS NULL THEN 1 END) as cv_sans_candidat
FROM cv_history;

-- 3. Voir quelques exemples de relations candidat-CV
SELECT 
  c.id as candidate_id,
  c.first_name || ' ' || c.last_name as candidat,
  c.email,
  COUNT(cv.id) as nombre_cv,
  STRING_AGG(cv.file_name, ', ') as fichiers_cv
FROM candidates c
LEFT JOIN cv_history cv ON c.id = cv.candidate_id
GROUP BY c.id, c.first_name, c.last_name, c.email
ORDER BY nombre_cv DESC
LIMIT 10;

-- 4. Vérifier les CV orphelins (sans candidat valide)
SELECT 
  cv.id,
  cv.candidate_id,
  cv.file_name,
  cv.uploaded_at
FROM cv_history cv
LEFT JOIN candidates c ON cv.candidate_id = c.id
WHERE c.id IS NULL;

-- 5. Statistiques sur les relations
SELECT 
  'Total candidats' as metrique,
  COUNT(*)::text as valeur
FROM candidates
UNION ALL
SELECT 
  'Total CV',
  COUNT(*)::text
FROM cv_history
UNION ALL
SELECT 
  'Candidats avec CV',
  COUNT(DISTINCT candidate_id)::text
FROM cv_history
UNION ALL
SELECT 
  'CV moyen par candidat',
  ROUND(AVG(cv_count), 2)::text
FROM (
  SELECT candidate_id, COUNT(*) as cv_count
  FROM cv_history
  GROUP BY candidate_id
) subquery;

-- ============================================
-- ✅ Résultat Attendu
-- ============================================
-- 
-- Si tout est correct :
-- - La contrainte FOREIGN KEY doit apparaître
-- - cv_sans_candidat doit être 0
-- - Aucun CV orphelin ne doit apparaître
-- ============================================
