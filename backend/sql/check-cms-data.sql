-- Script de vérification et correction des données CMS

-- 1. Vérifier les articles
SELECT 
    id, 
    title, 
    status, 
    published_at,
    category_id,
    created_at
FROM articles
ORDER BY created_at DESC;

-- 2. Vérifier le nombre d'articles par statut
SELECT 
    status, 
    COUNT(*) as count
FROM articles
GROUP BY status;

-- 3. Mettre à jour les articles Draft en Published (si nécessaire)
-- DÉCOMMENTEZ LA LIGNE SUIVANTE SI VOUS VOULEZ PUBLIER TOUS LES ARTICLES
-- UPDATE articles SET status = 'Published' WHERE status = 'Draft';

-- 4. Vérifier les ressources
SELECT 
    id,
    title,
    type,
    download_count,
    published_at,
    created_at
FROM resources
ORDER BY created_at DESC;

-- 5. Vérifier les catégories
SELECT * FROM categories_cms;

-- 6. Vérifier les tags
SELECT * FROM tags;

-- 7. Vérifier les relations article_tags
SELECT 
    at.article_id,
    a.title as article_title,
    at.tag_id,
    t.name as tag_name
FROM article_tags at
LEFT JOIN articles a ON at.article_id = a.id
LEFT JOIN tags t ON at.tag_id = t.id;

-- 8. Vérifier les articles avec leurs catégories
SELECT 
    a.id,
    a.title,
    a.status,
    c.name as category_name,
    c.slug as category_slug
FROM articles a
LEFT JOIN categories_cms c ON a.category_id = c.id
ORDER BY a.created_at DESC;

-- 9. Compter les articles publiés avec catégories
SELECT 
    COUNT(*) as total_published_articles
FROM articles
WHERE status = 'Published';

-- 10. Compter les ressources
SELECT 
    COUNT(*) as total_resources
FROM resources;

