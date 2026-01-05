-- ============================================
-- Configuration Supabase Storage pour les CV (CORRIGÉ)
-- ============================================
-- 
-- Instructions:
-- 1. Allez dans Supabase → Storage
-- 2. Créez un bucket nommé "cvs" (si pas déjà créé)
-- 3. Exécutez ce script SQL dans SQL Editor
-- ============================================

-- Créer le bucket "cvs" pour stocker les CV
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false, -- Privé par défaut (utiliser des URLs signées pour l'accès)
  20971520, -- 20 Mo max
  ARRAY['application/pdf'] -- Seulement PDF
)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow public upload to cvs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role upload to cvs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role read from cvs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role delete from cvs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role update in cvs bucket" ON storage.objects;

-- Politique pour permettre l'upload via service role (backend) - OBLIGATOIRE
-- Le backend utilise SUPABASE_SERVICE_ROLE_KEY pour uploader les CV
CREATE POLICY "Allow service role upload to cvs bucket"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'cvs');

-- Politique pour permettre la lecture via service role (backend)
CREATE POLICY "Allow service role read from cvs bucket"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'cvs');

-- Politique pour permettre la suppression via service role (backend)
CREATE POLICY "Allow service role delete from cvs bucket"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'cvs');

-- Politique pour permettre la mise à jour via service role (backend)
CREATE POLICY "Allow service role update in cvs bucket"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'cvs')
WITH CHECK (bucket_id = 'cvs');

-- Optionnel: Politique pour permettre l'upload public (pour le formulaire de candidature rapide)
-- Décommentez si vous voulez permettre l'upload depuis le frontend directement
-- CREATE POLICY "Allow public upload to cvs bucket"
-- ON storage.objects
-- FOR INSERT
-- TO anon, authenticated
-- WITH CHECK (bucket_id = 'cvs');





