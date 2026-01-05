-- ============================================
-- Activation RLS sur les autres tables Supabase
-- ============================================
-- 
-- Instructions:
-- 1. Allez dans Supabase → SQL Editor
-- 2. Vérifiez d'abord quelles tables existent avec: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- 3. Copiez-collez ce script
-- 4. Exécutez le script
-- ============================================

-- ============================================
-- Activer RLS sur les tables de stockage (Storage)
-- ============================================
-- Note: Les tables storage.* sont des tables système Supabase
-- qui nécessitent des permissions élevées. Elles sont généralement
-- déjà protégées par Supabase. On les ignore ici pour éviter les erreurs.

-- Table storage.objects (ignorée - nécessite permissions élevées)
-- Cette table est déjà protégée par Supabase

-- Table storage.buckets (ignorée - nécessite permissions élevées)
-- Cette table est déjà protégée par Supabase

-- ============================================
-- Activer RLS sur les tables publiques spécifiques
-- (Application, CV, CrmLog, User)
-- ============================================

-- Table Application
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Application') THEN
    BEGIN
      ALTER TABLE public."Application" ENABLE ROW LEVEL SECURITY;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'Application' 
        AND policyname = 'Allow all operations for service role'
      ) THEN
        CREATE POLICY "Allow all operations for service role"
          ON public."Application"
          FOR ALL
          USING (true)
          WITH CHECK (true);
      END IF;
      
      RAISE NOTICE '✅ RLS activé sur public.Application';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erreur pour public.Application: %', SQLERRM;
    END;
  END IF;
END $$;

-- Table CV
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'CV') THEN
    BEGIN
      ALTER TABLE public."CV" ENABLE ROW LEVEL SECURITY;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'CV' 
        AND policyname = 'Allow all operations for service role'
      ) THEN
        CREATE POLICY "Allow all operations for service role"
          ON public."CV"
          FOR ALL
          USING (true)
          WITH CHECK (true);
      END IF;
      
      RAISE NOTICE '✅ RLS activé sur public.CV';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erreur pour public.CV: %', SQLERRM;
    END;
  END IF;
END $$;

-- Table CrmLog
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'CrmLog') THEN
    BEGIN
      ALTER TABLE public."CrmLog" ENABLE ROW LEVEL SECURITY;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'CrmLog' 
        AND policyname = 'Allow all operations for service role'
      ) THEN
        CREATE POLICY "Allow all operations for service role"
          ON public."CrmLog"
          FOR ALL
          USING (true)
          WITH CHECK (true);
      END IF;
      
      RAISE NOTICE '✅ RLS activé sur public.CrmLog';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erreur pour public.CrmLog: %', SQLERRM;
    END;
  END IF;
END $$;

-- Table User
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
    BEGIN
      ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'User' 
        AND policyname = 'Allow all operations for service role'
      ) THEN
        CREATE POLICY "Allow all operations for service role"
          ON public."User"
          FOR ALL
          USING (true)
          WITH CHECK (true);
      END IF;
      
      RAISE NOTICE '✅ RLS activé sur public.User';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erreur pour public.User: %', SQLERRM;
    END;
  END IF;
END $$;

-- ============================================
-- Activer RLS sur toutes les autres tables publiques
-- (sauf celles déjà gérées explicitement)
-- ============================================

DO $$
DECLARE
  table_record RECORD;
BEGIN
  -- Parcourir toutes les tables publiques sauf celles déjà gérées
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('candidates', 'cv_history', 'admins', 'Application', 'CV', 'CrmLog', 'User')
  LOOP
    BEGIN
      -- Activer RLS
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_record.table_name);
      
      -- Créer une politique permissive si elle n'existe pas déjà
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = table_record.table_name 
        AND policyname = 'Allow all operations for service role'
      ) THEN
        EXECUTE format(
          'CREATE POLICY "Allow all operations for service role" ON %I FOR ALL USING (true) WITH CHECK (true)',
          table_record.table_name
        );
      END IF;
      
      RAISE NOTICE 'RLS activé sur public.%. Politique créée.', table_record.table_name;
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE '⚠️ Permissions insuffisantes pour public.%', table_record.table_name;
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erreur pour public.%: %', table_record.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================
-- Activer RLS sur les tables OAuth dans auth
-- ============================================

-- Table oauth_authorizations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'oauth_authorizations') THEN
    BEGIN
      ALTER TABLE auth.oauth_authorizations ENABLE ROW LEVEL SECURITY;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'auth' 
        AND tablename = 'oauth_authorizations' 
        AND policyname = 'Allow all operations for service role'
      ) THEN
        CREATE POLICY "Allow all operations for service role"
          ON auth.oauth_authorizations
          FOR ALL
          USING (true)
          WITH CHECK (true);
      END IF;
      
      RAISE NOTICE 'RLS activé sur auth.oauth_authorizations';
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE '⚠️ Permissions insuffisantes pour auth.oauth_authorizations (table système Supabase)';
    END;
  END IF;
END $$;

-- Table oauth_clients
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'oauth_clients') THEN
    BEGIN
      ALTER TABLE auth.oauth_clients ENABLE ROW LEVEL SECURITY;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'auth' 
        AND tablename = 'oauth_clients' 
        AND policyname = 'Allow all operations for service role'
      ) THEN
        CREATE POLICY "Allow all operations for service role"
          ON auth.oauth_clients
          FOR ALL
          USING (true)
          WITH CHECK (true);
      END IF;
      
      RAISE NOTICE 'RLS activé sur auth.oauth_clients';
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE '⚠️ Permissions insuffisantes pour auth.oauth_clients (table système Supabase)';
    END;
  END IF;
END $$;

-- Table oauth_consents
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'oauth_consents') THEN
    BEGIN
      ALTER TABLE auth.oauth_consents ENABLE ROW LEVEL SECURITY;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'auth' 
        AND tablename = 'oauth_consents' 
        AND policyname = 'Allow all operations for service role'
      ) THEN
        CREATE POLICY "Allow all operations for service role"
          ON auth.oauth_consents
          FOR ALL
          USING (true)
          WITH CHECK (true);
      END IF;
      
      RAISE NOTICE 'RLS activé sur auth.oauth_consents';
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE '⚠️ Permissions insuffisantes pour auth.oauth_consents (table système Supabase)';
    END;
  END IF;
END $$;

-- ============================================
-- Vérification: Lister toutes les tables avec RLS activé
-- ============================================

SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN 'Activé'
    ELSE 'Désactivé'
  END as rls_status
FROM pg_tables
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename;

-- ============================================
-- ✅ RLS activé sur toutes les autres tables!
-- ============================================
-- 
-- Note: Les politiques créées sont permissives car la sécurité
-- est gérée au niveau du site web NestJS (JWT + Guards).
-- ============================================
