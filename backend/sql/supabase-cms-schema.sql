-- Tables pour le CMS (Articles et Ressources)
-- Script de migration qui gère les tables existantes

-- Supprimer les tables existantes si elles existent (dans le bon ordre pour respecter les contraintes)
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS categories_cms CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Table Categories
CREATE TABLE categories_cms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  category_id UUID REFERENCES categories_cms(id) ON DELETE SET NULL,
  status VARCHAR(50) CHECK (status IN ('Draft', 'Published')) DEFAULT 'Draft',
  author_id UUID,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  
  -- Métadonnées
  views INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison Articles-Tags (many-to-many)
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Table Ressources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('PDF', 'Guide', 'Template')) DEFAULT 'PDF',
  download_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_meta_title ON articles(meta_title);
CREATE INDEX idx_categories_slug ON categories_cms(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);
CREATE INDEX idx_resources_slug ON resources(slug);
CREATE INDEX idx_resources_type ON resources(type);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories_cms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Désactiver RLS (Row Level Security) pour permettre l'accès depuis le backend
-- Si vous souhaitez activer RLS plus tard, vous devrez créer des politiques appropriées
ALTER TABLE categories_cms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour permettre l'accès public en lecture
-- Ces politiques permettent à tous les utilisateurs (y compris anonymes) de lire les données
CREATE POLICY "Allow public read access on categories_cms" ON categories_cms
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on resources" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on article_tags" ON article_tags
  FOR SELECT USING (true);

-- Note: Pour les opérations d'écriture (INSERT, UPDATE, DELETE), vous devrez
-- soit utiliser la SERVICE_ROLE_KEY (qui bypass RLS), soit créer des politiques
-- appropriées pour les utilisateurs authentifiés.