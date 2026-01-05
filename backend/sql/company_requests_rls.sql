-- ============================================
-- Configuration RLS (Row Level Security) pour company_requests
-- À exécuter dans Supabase SQL Editor si la table existe déjà
-- ============================================

-- Activer RLS sur la table company_requests
ALTER TABLE company_requests ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent (pour éviter les doublons)
DROP POLICY IF EXISTS "Allow public insert on company_requests" ON company_requests;
DROP POLICY IF EXISTS "Allow service role read on company_requests" ON company_requests;
DROP POLICY IF EXISTS "Allow service role update on company_requests" ON company_requests;
DROP POLICY IF EXISTS "Allow service role delete on company_requests" ON company_requests;

-- Politique pour permettre l'insertion publique (depuis le formulaire)
CREATE POLICY "Allow public insert on company_requests"
  ON company_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Politique pour permettre la lecture par le service role (backend)
CREATE POLICY "Allow service role read on company_requests"
  ON company_requests
  FOR SELECT
  TO service_role
  USING (true);

-- Politique pour permettre la mise à jour par le service role (backend)
CREATE POLICY "Allow service role update on company_requests"
  ON company_requests
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Politique pour permettre la suppression par le service role (backend)
CREATE POLICY "Allow service role delete on company_requests"
  ON company_requests
  FOR DELETE
  TO service_role
  USING (true);

-- Vérifier que les politiques sont créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'company_requests';

-- ============================================
-- ✅ RLS configuré pour company_requests!
-- ============================================
-- 
-- Note: Le backend doit utiliser SUPABASE_SERVICE_ROLE_KEY
-- pour bypasser RLS et accéder aux données.
-- ============================================





