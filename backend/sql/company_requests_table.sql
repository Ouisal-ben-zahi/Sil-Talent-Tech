-- Table pour les demandes entreprise
CREATE TABLE IF NOT EXISTS company_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(255) NOT NULL,
  company_size VARCHAR(50) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  position VARCHAR(255),
  location VARCHAR(255),
  urgency VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  crm_sync_status VARCHAR(50) DEFAULT 'pending',
  crm_sync_date TIMESTAMP WITH TIME ZONE,
  crm_sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_company_requests_email ON company_requests(email);
CREATE INDEX IF NOT EXISTS idx_company_requests_status ON company_requests(status);
CREATE INDEX IF NOT EXISTS idx_company_requests_crm_sync_status ON company_requests(crm_sync_status);
CREATE INDEX IF NOT EXISTS idx_company_requests_created_at ON company_requests(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_company_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_requests_updated_at_trigger
  BEFORE UPDATE ON company_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_company_requests_updated_at();

-- RLS (Row Level Security) - Activé pour sécuriser l'accès
ALTER TABLE company_requests ENABLE ROW LEVEL SECURITY;

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

-- Commentaires pour la documentation
COMMENT ON TABLE company_requests IS 'Table pour stocker les demandes de profils ou d''échanges des entreprises';
COMMENT ON COLUMN company_requests.status IS 'Statut de la demande: new, in_progress, contacted, closed';
COMMENT ON COLUMN company_requests.crm_sync_status IS 'Statut de synchronisation CRM: pending, synced, failed';
COMMENT ON COLUMN company_requests.company_size IS 'Taille de l''entreprise: small, medium, large, enterprise';
COMMENT ON COLUMN company_requests.urgency IS 'Niveau d''urgence: low, medium, high, urgent';

