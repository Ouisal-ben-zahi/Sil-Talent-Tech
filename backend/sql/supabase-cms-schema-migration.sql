-- Script de migration pour mettre à jour les tables existantes
-- Utilisez ce script si vous avez déjà des données et voulez migrer

-- 1. Supprimer la table de liaison si elle existe
DROP TABLE IF EXISTS article_tags CASCADE;

-- 2. Créer les nouvelles tables si elles n'existent pas
CREATE TABLE IF NOT EXISTS categories_cms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modifier la table articles si elle existe déjà
DO $$
BEGIN
  -- Vérifier si la table articles existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles') THEN
    -- Ajouter category_id si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'category_id') THEN
      ALTER TABLE articles ADD COLUMN category_id UUID REFERENCES categories_cms(id) ON DELETE SET NULL;
    END IF;
    
    -- Supprimer l'ancienne colonne category si elle existe (et qu'elle n'est pas category_id)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'category' AND column_name != 'category_id') THEN
      ALTER TABLE articles DROP COLUMN category;
    END IF;
    
    -- Ajouter les colonnes SEO si elles n'existent pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'meta_title') THEN
      ALTER TABLE articles ADD COLUMN meta_title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'meta_description') THEN
      ALTER TABLE articles ADD COLUMN meta_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'meta_keywords') THEN
      ALTER TABLE articles ADD COLUMN meta_keywords VARCHAR(500);
    END IF;
    
    -- Ajouter les colonnes métadonnées si elles n'existent pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'views') THEN
      ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'reading_time') THEN
      ALTER TABLE articles ADD COLUMN reading_time INTEGER DEFAULT 0;
    END IF;
    
    -- Ajouter scheduled_at si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'scheduled_at') THEN
      ALTER TABLE articles ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
    END IF;
  ELSE
    -- Créer la table articles si elle n'existe pas
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
      meta_title VARCHAR(255),
      meta_description TEXT,
      meta_keywords VARCHAR(500),
      views INTEGER DEFAULT 0,
      reading_time INTEGER DEFAULT 0,
      published_at TIMESTAMP WITH TIME ZONE,
      scheduled_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- 4. Créer la table de liaison article_tags
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 5. Créer la table resources si elle n'existe pas
CREATE TABLE IF NOT EXISTS resources (
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

-- 6. Créer les index (ignore les erreurs si ils existent déjà)
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
  CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
  CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
  CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
  CREATE INDEX IF NOT EXISTS idx_articles_meta_title ON articles(meta_title);
  CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories_cms(slug);
  CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
  CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
  CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug);
  CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 7. Créer ou remplacer la fonction trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer les triggers (supprimer d'abord s'ils existent)
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories_cms;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories_cms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

