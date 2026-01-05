-- ============================================
-- Table pour stocker les messages de contact
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

-- Créer un index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Créer un index sur le statut pour filtrer les messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- Créer un index sur la date de création pour trier par date
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER trigger_update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE contact_messages IS 'Table pour stocker les messages du formulaire de contact';
COMMENT ON COLUMN contact_messages.id IS 'Identifiant unique du message';
COMMENT ON COLUMN contact_messages.name IS 'Nom de la personne qui a envoyé le message';
COMMENT ON COLUMN contact_messages.email IS 'Email de contact';
COMMENT ON COLUMN contact_messages.phone IS 'Numéro de téléphone (optionnel)';
COMMENT ON COLUMN contact_messages.company IS 'Nom de l\'entreprise (optionnel)';
COMMENT ON COLUMN contact_messages.subject IS 'Sujet du message';
COMMENT ON COLUMN contact_messages.message IS 'Contenu du message';
COMMENT ON COLUMN contact_messages.status IS 'Statut du message: new, read, replied, archived';
COMMENT ON COLUMN contact_messages.created_at IS 'Date de création du message';
COMMENT ON COLUMN contact_messages.updated_at IS 'Date de dernière modification';

-- RLS (Row Level Security) - Activé pour sécuriser l'accès
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (pour le formulaire de contact)
-- Les utilisateurs anonymes et authentifiés peuvent insérer des messages
CREATE POLICY "Allow public insert on contact_messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politique pour permettre la lecture uniquement via service role (backend)
-- Seul le backend avec service_role peut lire les messages
CREATE POLICY "Allow service role read on contact_messages"
  ON contact_messages
  FOR SELECT
  TO service_role
  USING (true);

-- Politique pour permettre la mise à jour uniquement via service role (backend)
-- Seul le backend peut mettre à jour le statut des messages
CREATE POLICY "Allow service role update on contact_messages"
  ON contact_messages
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Politique pour permettre la suppression uniquement via service role (backend)
-- Seul le backend peut supprimer les messages
CREATE POLICY "Allow service role delete on contact_messages"
  ON contact_messages
  FOR DELETE
  TO service_role
  USING (true);

