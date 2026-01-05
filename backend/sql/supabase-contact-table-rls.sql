-- ============================================
-- Activation RLS pour la table contact_messages
-- ============================================
-- 
-- À exécuter APRÈS avoir créé la table contact_messages
-- Si vous avez déjà créé la table, exécutez seulement ce script
-- ============================================

-- Activer RLS sur la table
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow service role read on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow service role update on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow service role delete on contact_messages" ON contact_messages;

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





