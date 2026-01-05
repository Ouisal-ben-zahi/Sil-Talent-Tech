-- Script pour mettre à jour les URLs des ressources avec de vraies URLs de fichiers
-- Les fichiers PDF seront stockés dans frontend/public/resources/

-- Mettre à jour les URLs des ressources
UPDATE "public"."resources"
SET 
  "file_url" = CASE 
    WHEN "slug" = 'guide-preparation-entretiens-techniques' THEN 
      '/resources/guide-preparation-entretiens-techniques.pdf'
    WHEN "slug" = 'template-cv-developpeurs' THEN 
      '/resources/template-cv-developpeurs.docx'
    WHEN "slug" = 'checklist-recherche-emploi-tech' THEN 
      '/resources/checklist-recherche-emploi-tech.pdf'
    WHEN "slug" = 'guide-salaires-tech-2024' THEN 
      '/resources/guide-salaires-tech-2024.pdf'
    WHEN "slug" = 'template-lettre-motivation-tech' THEN 
      '/resources/template-lettre-motivation-tech.docx'
    ELSE "file_url"
  END,
  "updated_at" = NOW()
WHERE "slug" IN (
  'guide-preparation-entretiens-techniques',
  'template-cv-developpeurs',
  'checklist-recherche-emploi-tech',
  'guide-salaires-tech-2024',
  'template-lettre-motivation-tech'
);

-- Vérifier les mises à jour
SELECT 
  "id",
  "title",
  "slug",
  "file_url",
  "type",
  "updated_at"
FROM "public"."resources"
ORDER BY "created_at" DESC;

