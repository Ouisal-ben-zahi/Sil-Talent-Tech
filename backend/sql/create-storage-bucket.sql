-- ============================================
-- Création du bucket Supabase Storage pour les CV
-- ============================================
-- 
-- Instructions:
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez-collez ce script
-- 3. Exécutez le script
-- ============================================

-- Créer le bucket pour les CV
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false, -- Privé (non public)
  10485760, -- 10 Mo max
  ARRAY['application/pdf'] -- PDF uniquement
)
ON CONFLICT (id) DO NOTHING;

-- Créer une politique pour permettre l'upload depuis le backend
CREATE POLICY "Allow service role to upload CVs"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'cvs');

-- Créer une politique pour permettre la lecture depuis le backend
CREATE POLICY "Allow service role to read CVs"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'cvs');

-- Créer une politique pour permettre la suppression depuis le backend
CREATE POLICY "Allow service role to delete CVs"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'cvs');

-- ============================================
-- ✅ Bucket créé avec succès!
-- ============================================
-- 
-- Le bucket 'cvs' est maintenant disponible pour stocker les CV.
-- Les fichiers seront privés et accessibles uniquement via l'API backend.
-- ============================================
