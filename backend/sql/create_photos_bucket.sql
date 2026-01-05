-- ============================================
-- Créer le bucket "photos" dans Supabase Storage
-- ============================================
-- 
-- Instructions:
-- 1. Allez dans Supabase → Storage
-- 2. Cliquez sur "New bucket"
-- 3. Nom: "photos"
-- 4. Public: false (privé)
-- 5. Ou utilisez l'API Supabase pour créer le bucket
-- ============================================

-- Note: Ce script SQL ne peut pas créer directement un bucket Storage
-- Vous devez utiliser l'interface Supabase ou l'API REST

-- Pour créer via l'API REST (exemple avec curl):
-- curl -X POST 'https://YOUR_PROJECT.supabase.co/storage/v1/bucket' \
--   -H "apikey: YOUR_SERVICE_ROLE_KEY" \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{"name":"photos","public":false}'

-- Ou créez-le manuellement dans Supabase Dashboard:
-- 1. Allez dans Storage
-- 2. Cliquez sur "New bucket"
-- 3. Nom: "photos"
-- 4. Public: false
-- 5. Cliquez sur "Create bucket"

-- Après création, configurez les politiques RLS si nécessaire
-- (Les politiques par défaut peuvent nécessiter d'être ajustées)





