-- ============================================
-- Suppression des Anciennes Tables Non Utilisées
-- ============================================
-- 
-- Ce script supprime les anciennes tables qui ne sont plus utilisées :
-- - CV (remplacée par cv_history)
-- - User (remplacée par candidates)
-- - Application (non utilisée)
-- - CrmLog (non utilisée)
-- 
-- Instructions:
-- 1. Allez dans Supabase → SQL Editor
-- 2. Vérifiez d'abord que ces tables sont vides ou ne contiennent pas de données importantes
-- 3. Copiez-collez ce script
-- 4. Exécutez le script
-- ============================================

-- Vérifier le contenu des tables avant suppression
DO $$
DECLARE
  cv_count INTEGER := 0;
  user_count INTEGER := 0;
  app_count INTEGER := 0;
  crmlog_count INTEGER := 0;
BEGIN
  RAISE NOTICE '📊 Vérification du contenu des tables avant suppression:';
  
  -- Compter les enregistrements dans chaque table (si elles existent)
  BEGIN
    SELECT COUNT(*) INTO cv_count FROM "CV";
    RAISE NOTICE '   CV: % enregistrement(s)', cv_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '   CV: Table n''existe pas';
  END;
  
  BEGIN
    SELECT COUNT(*) INTO user_count FROM "User";
    RAISE NOTICE '   User: % enregistrement(s)', user_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '   User: Table n''existe pas';
  END;
  
  BEGIN
    SELECT COUNT(*) INTO app_count FROM "Application";
    RAISE NOTICE '   Application: % enregistrement(s)', app_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '   Application: Table n''existe pas';
  END;
  
  BEGIN
    SELECT COUNT(*) INTO crmlog_count FROM "CrmLog";
    RAISE NOTICE '   CrmLog: % enregistrement(s)', crmlog_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '   CrmLog: Table n''existe pas';
  END;
  
  IF cv_count > 0 OR user_count > 0 OR app_count > 0 OR crmlog_count > 0 THEN
    RAISE WARNING '⚠️  Certaines tables contiennent des données. Vérifiez avant de supprimer !';
  ELSE
    RAISE NOTICE '✅ Toutes les tables sont vides ou n''existent pas, suppression sécurisée';
  END IF;
END $$;

-- Supprimer les tables (dans l'ordre pour éviter les erreurs de dépendances)
-- Note: CASCADE supprimera aussi les contraintes et index associés

-- 1. Supprimer CrmLog
DROP TABLE IF EXISTS "CrmLog" CASCADE;
DO $$ BEGIN
  RAISE NOTICE '✅ Table CrmLog supprimée';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erreur lors de la suppression de CrmLog: %', SQLERRM;
END $$;

-- 2. Supprimer CV
DROP TABLE IF EXISTS "CV" CASCADE;
DO $$ BEGIN
  RAISE NOTICE '✅ Table CV supprimée';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erreur lors de la suppression de CV: %', SQLERRM;
END $$;

-- 3. Supprimer Application
DROP TABLE IF EXISTS "Application" CASCADE;
DO $$ BEGIN
  RAISE NOTICE '✅ Table Application supprimée';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erreur lors de la suppression de Application: %', SQLERRM;
END $$;

-- 4. Supprimer User (en dernier car peut avoir des dépendances)
DROP TABLE IF EXISTS "User" CASCADE;
DO $$ BEGIN
  RAISE NOTICE '✅ Table User supprimée';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erreur lors de la suppression de User: %', SQLERRM;
END $$;

-- Vérifier que les tables ont bien été supprimées
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Toutes les anciennes tables ont été supprimées'
    ELSE '⚠️  Certaines tables sont encore présentes: ' || STRING_AGG(table_name, ', ')
  END as resultat
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('CV', 'User', 'Application', 'CrmLog');

-- Afficher les tables restantes (celles qui sont utilisées)
SELECT 
  'Tables utilisées restantes:' as info,
  STRING_AGG(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name NOT IN ('CV', 'User', 'Application', 'CrmLog');

-- ============================================
-- ✅ Anciennes tables supprimées!
-- ============================================
-- 
-- Tables supprimées :
-- - CV (remplacée par cv_history)
-- - User (remplacée par candidates)
-- - Application (non utilisée)
-- - CrmLog (non utilisée)
-- 
-- Tables conservées (utilisées par le backend) :
-- - candidates
-- - cv_history
-- - admins
-- - contact_messages (si existe)
-- ============================================
