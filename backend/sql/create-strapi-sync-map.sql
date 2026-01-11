-- Table de mapping pour synchroniser les IDs Strapi avec les IDs Supabase
-- Cette table permet de maintenir la correspondance entre les deux systèmes

CREATE TABLE IF NOT EXISTS strapi_sync_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strapi_table VARCHAR(100) NOT NULL,
  strapi_id VARCHAR(255) NOT NULL,
  supabase_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(strapi_table, strapi_id)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_strapi_sync_map_table_id ON strapi_sync_map(strapi_table, strapi_id);
CREATE INDEX IF NOT EXISTS idx_strapi_sync_map_supabase_id ON strapi_sync_map(supabase_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_strapi_sync_map_updated_at
  BEFORE UPDATE ON strapi_sync_map
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: Seul le backend (service_role) peut modifier cette table
ALTER TABLE strapi_sync_map ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture (optionnel, selon vos besoins)
CREATE POLICY "Allow public read access on strapi_sync_map" ON strapi_sync_map
  FOR SELECT USING (true);

-- Note: Les opérations INSERT/UPDATE/DELETE seront effectuées uniquement
-- via le backend avec SERVICE_ROLE_KEY (qui bypass RLS)















