-- ============================================
-- Table pour stocker les messages de contact
-- ============================================
-- Copiez ce script dans Supabase SQL Editor et exécutez-le
-- ============================================

-- Créer la table contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER trigger_update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Activer RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow service role read on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow service role update on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow service role delete on contact_messages" ON contact_messages;

-- Politique pour permettre l'insertion publique
CREATE POLICY "Allow public insert on contact_messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politique pour permettre la lecture via service role
CREATE POLICY "Allow service role read on contact_messages"
  ON contact_messages
  FOR SELECT
  TO service_role
  USING (true);

-- Politique pour permettre la mise à jour via service role
CREATE POLICY "Allow service role update on contact_messages"
  ON contact_messages
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Politique pour permettre la suppression via service role
CREATE POLICY "Allow service role delete on contact_messages"
  ON contact_messages
  FOR DELETE
  TO service_role
  USING (true);





