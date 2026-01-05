-- ============================================
-- Configuration RLS (Row Level Security) pour categories
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Activer RLS sur la table categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (SELECT) de toutes les catégories
CREATE POLICY "Allow public read access to categories"
ON categories
FOR SELECT
TO public
USING (true);

-- Politique pour permettre l'insertion uniquement aux admins (si nécessaire)
-- Cette politique peut être créée plus tard si vous avez besoin de restreindre l'insertion

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
WHERE tablename = 'categories';






