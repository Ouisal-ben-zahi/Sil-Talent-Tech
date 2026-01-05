import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CmsService } from '../cms/cms.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedCMS() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cmsService = app.get(CmsService);

  console.log('🌱 Début du seed CMS...\n');

  try {
    // ========== CATEGORIES ==========
    console.log('📁 Création des catégories...');
    
    const categories = [
      {
        name: 'Blog',
        slug: 'blog',
        description: 'Articles de blog sur le recrutement tech',
        color: '#297BFF',
      },
      {
        name: 'Actualités',
        slug: 'actualites',
        description: 'Actualités du secteur tech et recrutement',
        color: '#FF6B6B',
      },
      {
        name: 'Conseils',
        slug: 'conseils',
        description: 'Conseils pour les candidats et recruteurs',
        color: '#51CF66',
      },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      try {
        // Vérifier si la catégorie existe déjà
        let category = await cmsService.findCategoryBySlug(cat.slug);
        if (!category) {
          category = await cmsService.createCategory(cat);
          console.log(`  ✅ Catégorie créée: ${category.name}`);
        } else {
          console.log(`  ℹ️  Catégorie existe déjà: ${category.name}`);
        }
        createdCategories.push(category);
      } catch (error: any) {
        console.error(`  ❌ Erreur avec la catégorie ${cat.name}: ${error.message}`);
        // Essayer de récupérer quand même la catégorie existante
        try {
          const existingCategory = await cmsService.findCategoryBySlug(cat.slug);
          if (existingCategory) {
            createdCategories.push(existingCategory);
          }
        } catch (e) {
          // Ignorer si on ne peut pas récupérer
        }
      }
    }

    // ========== TAGS ==========
    console.log('\n🏷️  Création des tags...');
    
    const tags = [
      { name: 'JavaScript', slug: 'javascript' },
      { name: 'React', slug: 'react' },
      { name: 'Node.js', slug: 'nodejs' },
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'Python', slug: 'python' },
      { name: 'Recrutement', slug: 'recrutement' },
      { name: 'Carrière', slug: 'carriere' },
      { name: 'Tech', slug: 'tech' },
      { name: 'Développement', slug: 'developpement' },
      { name: 'Conseils', slug: 'conseils' },
    ];

    const createdTags = [];
    for (const tag of tags) {
      try {
        // Vérifier si le tag existe déjà
        let createdTag = await cmsService.findTagBySlug(tag.slug);
        if (!createdTag) {
          createdTag = await cmsService.createTag(tag);
          console.log(`  ✅ Tag créé: ${createdTag.name}`);
        } else {
          console.log(`  ℹ️  Tag existe déjà: ${createdTag.name}`);
        }
        createdTags.push(createdTag);
      } catch (error: any) {
        console.error(`  ❌ Erreur avec le tag ${tag.name}: ${error.message}`);
        // Essayer de récupérer quand même le tag existant
        try {
          const existingTag = await cmsService.findTagBySlug(tag.slug);
          if (existingTag) {
            createdTags.push(existingTag);
          }
        } catch (e) {
          // Ignorer si on ne peut pas récupérer
        }
      }
    }

    // ========== ARTICLES ==========
    console.log('\n📝 Création des articles...');

    const articles = [
      {
        title: 'Comment réussir votre entretien technique en 2024',
        slug: 'comment-reussir-entretien-technique-2024',
        content: `
          <h2>Introduction</h2>
          <p>Les entretiens techniques évoluent constamment. En 2024, les recruteurs cherchent non seulement des compétences techniques, mais aussi une capacité à résoudre des problèmes complexes et à travailler en équipe.</p>
          
          <h2>Préparation avant l'entretien</h2>
          <p>Avant votre entretien, assurez-vous de :</p>
          <ul>
            <li>Réviser les concepts fondamentaux de votre stack technique</li>
            <li>Pratiquer sur des plateformes comme LeetCode ou HackerRank</li>
            <li>Préparer des questions sur le projet et l'équipe</li>
            <li>Vérifier votre environnement de développement</li>
          </ul>
          
          <h2>Pendant l'entretien</h2>
          <p>Pendant l'entretien technique :</p>
          <ul>
            <li>Communiquez votre processus de réflexion</li>
            <li>Posez des questions pour clarifier les exigences</li>
            <li>Ne paniquez pas si vous ne connaissez pas la réponse immédiatement</li>
            <li>Montrez votre capacité à apprendre et à vous adapter</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>Un entretien technique réussi ne dépend pas seulement de vos compétences techniques, mais aussi de votre capacité à communiquer et à collaborer. Préparez-vous bien et restez confiant !</p>
        `,
        excerpt: 'Découvrez les meilleures pratiques pour réussir vos entretiens techniques en 2024. Conseils pratiques et stratégies éprouvées.',
        featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        categoryId: createdCategories[2]?.id, // Conseils
        tagIds: [createdTags[5]?.id, createdTags[6]?.id, createdTags[7]?.id].filter(Boolean),
        status: 'Published' as const,
        metaTitle: 'Comment réussir votre entretien technique en 2024 | Sil Talents Tech',
        metaDescription: 'Guide complet pour réussir vos entretiens techniques en 2024. Conseils pratiques, stratégies et astuces pour les développeurs.',
        metaKeywords: 'entretien technique, recrutement tech, conseils carrière, développeur',
        views: 0,
        readingTime: 5,
        publishedAt: new Date(),
      },
      {
        title: 'Les tendances du recrutement tech en 2024',
        slug: 'tendances-recrutement-tech-2024',
        content: `
          <h2>Introduction</h2>
          <p>Le secteur du recrutement tech connaît des évolutions majeures en 2024. Les entreprises adaptent leurs stratégies pour attirer et retenir les meilleurs talents.</p>
          
          <h2>Tendances principales</h2>
          <h3>1. Remote-first</h3>
          <p>Le télétravail devient la norme. Les entreprises qui n'offrent pas de flexibilité perdent des candidats qualifiés.</p>
          
          <h3>2. Focus sur les soft skills</h3>
          <p>Au-delà des compétences techniques, les recruteurs valorisent de plus en plus les compétences comportementales : communication, collaboration, adaptabilité.</p>
          
          <h3>3. Processus de recrutement accéléré</h3>
          <p>Les candidats ne veulent plus attendre des semaines. Les entreprises optimisent leurs processus pour réduire le temps de recrutement.</p>
          
          <h2>Impact sur les candidats</h2>
          <p>Ces tendances offrent plus d'opportunités aux candidats, mais exigent aussi une meilleure préparation et une meilleure visibilité en ligne.</p>
          
          <h2>Conclusion</h2>
          <p>Le marché du recrutement tech en 2024 est dynamique et offre de nombreuses opportunités pour ceux qui savent s'adapter.</p>
        `,
        excerpt: 'Découvrez les principales tendances qui façonnent le recrutement tech en 2024 et comment elles impactent les candidats et les entreprises.',
        featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        categoryId: createdCategories[1]?.id, // Actualités
        tagIds: [createdTags[5]?.id, createdTags[7]?.id].filter(Boolean),
        status: 'Published' as const,
        metaTitle: 'Les tendances du recrutement tech en 2024 | Sil Talents Tech',
        metaDescription: 'Découvrez les tendances qui façonnent le recrutement tech en 2024 : remote-first, soft skills, processus accélérés.',
        metaKeywords: 'recrutement tech, tendances 2024, marché de l\'emploi tech',
        views: 0,
        readingTime: 7,
        publishedAt: new Date(),
      },
      {
        title: 'Pourquoi choisir TypeScript pour vos projets React',
        slug: 'pourquoi-choisir-typescript-react',
        content: `
          <h2>Introduction</h2>
          <p>TypeScript est devenu un standard dans l'écosystème React. Découvrez pourquoi il est essentiel pour vos projets modernes.</p>
          
          <h2>Avantages de TypeScript</h2>
          <h3>1. Sécurité de type</h3>
          <p>TypeScript détecte les erreurs avant l'exécution, réduisant considérablement les bugs en production.</p>
          
          <h3>2. Meilleure expérience développeur</h3>
          <p>L'autocomplétion et la documentation inline améliorent la productivité et réduisent le temps de développement.</p>
          
          <h3>3. Maintenabilité</h3>
          <p>Le code TypeScript est plus facile à maintenir, surtout dans les grandes équipes et projets complexes.</p>
          
          <h2>Migration progressive</h2>
          <p>Vous pouvez migrer progressivement votre projet React vers TypeScript sans tout réécrire d'un coup.</p>
          
          <h2>Conclusion</h2>
          <p>TypeScript n'est plus une option mais une nécessité pour les projets React modernes. Investissez dans l'apprentissage de TypeScript pour booster votre carrière.</p>
        `,
        excerpt: 'Découvrez pourquoi TypeScript est devenu essentiel pour les projets React modernes et comment il améliore votre productivité.',
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        categoryId: createdCategories[0]?.id, // Blog
        tagIds: [createdTags[0]?.id, createdTags[1]?.id, createdTags[3]?.id, createdTags[8]?.id].filter(Boolean),
        status: 'Published' as const,
        metaTitle: 'Pourquoi choisir TypeScript pour vos projets React | Sil Talents Tech',
        metaDescription: 'Guide complet sur les avantages de TypeScript pour React : sécurité de type, productivité, maintenabilité.',
        metaKeywords: 'TypeScript, React, développement web, JavaScript',
        views: 0,
        readingTime: 6,
        publishedAt: new Date(),
      },
      {
        title: 'Guide complet : Devenir développeur Node.js',
        slug: 'guide-devenir-developpeur-nodejs',
        content: `
          <h2>Introduction</h2>
          <p>Node.js est l'un des environnements d'exécution JavaScript les plus populaires. Ce guide vous accompagne dans votre parcours pour devenir développeur Node.js.</p>
          
          <h2>Compétences requises</h2>
          <ul>
            <li>Maîtrise de JavaScript (ES6+)</li>
            <li>Compréhension des concepts asynchrones</li>
            <li>Connaissance des bases de données</li>
            <li>Familiarité avec les frameworks (Express, NestJS)</li>
          </ul>
          
          <h2>Parcours d'apprentissage</h2>
          <h3>Étape 1 : Fondamentaux</h3>
          <p>Commencez par maîtriser JavaScript et les concepts de base de Node.js.</p>
          
          <h3>Étape 2 : Frameworks</h3>
          <p>Apprenez Express.js pour créer des APIs REST, puis explorez NestJS pour des projets plus complexes.</p>
          
          <h3>Étape 3 : Projets pratiques</h3>
          <p>Construisez des projets réels pour mettre en pratique vos connaissances.</p>
          
          <h2>Ressources recommandées</h2>
          <p>Documentation officielle, cours en ligne, projets open-source... Les ressources ne manquent pas !</p>
          
          <h2>Conclusion</h2>
          <p>Devenir développeur Node.js demande de la pratique et de la persévérance, mais les opportunités sont nombreuses.</p>
        `,
        excerpt: 'Guide complet pour devenir développeur Node.js : compétences requises, parcours d\'apprentissage et ressources recommandées.',
        featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        categoryId: createdCategories[2]?.id, // Conseils
        tagIds: [createdTags[2]?.id, createdTags[8]?.id, createdTags[6]?.id].filter(Boolean),
        status: 'Published' as const,
        metaTitle: 'Guide complet : Devenir développeur Node.js | Sil Talents Tech',
        metaDescription: 'Guide étape par étape pour devenir développeur Node.js : compétences, parcours d\'apprentissage, ressources.',
        metaKeywords: 'Node.js, développeur backend, JavaScript, carrière tech',
        views: 0,
        readingTime: 8,
        publishedAt: new Date(),
      },
      {
        title: 'Les meilleures pratiques pour optimiser vos applications React',
        slug: 'meilleures-pratiques-optimiser-react',
        content: `
          <h2>Introduction</h2>
          <p>L'optimisation des applications React est cruciale pour offrir une expérience utilisateur fluide. Voici les meilleures pratiques.</p>
          
          <h2>Optimisations principales</h2>
          <h3>1. Utilisation de React.memo</h3>
          <p>Mémorisez les composants pour éviter les re-renders inutiles.</p>
          
          <h3>2. Code splitting</h3>
          <p>Divisez votre code en chunks pour réduire le temps de chargement initial.</p>
          
          <h3>3. Lazy loading</h3>
          <p>Chargez les composants à la demande pour améliorer les performances.</p>
          
          <h3>4. Optimisation des images</h3>
          <p>Utilisez des formats modernes comme WebP et optimisez la taille des images.</p>
          
          <h2>Outils de mesure</h2>
          <p>Utilisez React DevTools Profiler et Lighthouse pour identifier les goulots d'étranglement.</p>
          
          <h2>Conclusion</h2>
          <p>L'optimisation est un processus continu. Surveillez régulièrement les performances de votre application.</p>
        `,
        excerpt: 'Découvrez les meilleures pratiques pour optimiser vos applications React et améliorer les performances.',
        featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        categoryId: createdCategories[0]?.id, // Blog
        tagIds: [createdTags[1]?.id, createdTags[8]?.id].filter(Boolean),
        status: 'Published' as const,
        metaTitle: 'Les meilleures pratiques pour optimiser vos applications React | Sil Talents Tech',
        metaDescription: 'Guide des meilleures pratiques pour optimiser vos applications React : React.memo, code splitting, lazy loading.',
        metaKeywords: 'React, optimisation, performance, développement web',
        views: 0,
        readingTime: 6,
        publishedAt: new Date(),
      },
    ];

    let articlesCreated = 0;
    let articlesSkipped = 0;
    for (const article of articles) {
      try {
        // Vérifier si l'article existe déjà
        const existingArticle = await cmsService.findArticleBySlug(article.slug);
        if (existingArticle) {
          console.log(`  ℹ️  Article existe déjà: ${article.title}`);
          articlesSkipped++;
          continue;
        }
        const createdArticle = await cmsService.createArticle(article);
        console.log(`  ✅ Article créé: ${createdArticle.title}`);
        articlesCreated++;
      } catch (error: any) {
        console.error(`  ❌ Erreur avec l'article ${article.title}: ${error.message}`);
        articlesSkipped++;
      }
    }

    // ========== RESSOURCES ==========
    console.log('\n📚 Création des ressources...');

    const resources = [
      {
        title: 'Guide de préparation aux entretiens techniques',
        slug: 'guide-preparation-entretiens-techniques',
        description: 'Un guide complet de 50 pages pour vous préparer aux entretiens techniques. Inclut des exemples de questions, des conseils pratiques et des stratégies de résolution de problèmes.',
        fileUrl: 'https://example.com/resources/guide-entretiens-techniques.pdf',
        type: 'PDF' as const,
        publishedAt: new Date(),
      },
      {
        title: 'Template de CV pour développeurs',
        slug: 'template-cv-developpeurs',
        description: 'Template professionnel de CV optimisé pour les développeurs. Format Word et PDF inclus. Mettez en valeur vos compétences techniques et vos projets.',
        fileUrl: 'https://example.com/resources/template-cv-developpeur.docx',
        type: 'Template' as const,
        publishedAt: new Date(),
      },
      {
        title: 'Checklist de recherche d\'emploi tech',
        slug: 'checklist-recherche-emploi-tech',
        description: 'Une checklist complète pour organiser votre recherche d\'emploi dans le secteur tech. De la préparation à la négociation salariale.',
        fileUrl: 'https://example.com/resources/checklist-recherche-emploi.pdf',
        type: 'Guide' as const,
        publishedAt: new Date(),
      },
      {
        title: 'Guide des salaires tech 2024',
        slug: 'guide-salaires-tech-2024',
        description: 'Référence complète des salaires dans le secteur tech en 2024. Par poste, par niveau d\'expérience et par région.',
        fileUrl: 'https://example.com/resources/guide-salaires-tech-2024.pdf',
        type: 'PDF' as const,
        publishedAt: new Date(),
      },
      {
        title: 'Template de lettre de motivation tech',
        slug: 'template-lettre-motivation-tech',
        description: 'Modèle de lettre de motivation adapté aux postes tech. Personnalisable et optimisé pour attirer l\'attention des recruteurs.',
        fileUrl: 'https://example.com/resources/template-lettre-motivation.docx',
        type: 'Template' as const,
        publishedAt: new Date(),
      },
    ];

    let resourcesCreated = 0;
    let resourcesSkipped = 0;
    for (const resource of resources) {
      try {
        // Vérifier si la ressource existe déjà
        const existingResource = await cmsService.findResourceBySlug(resource.slug);
        if (existingResource) {
          console.log(`  ℹ️  Ressource existe déjà: ${resource.title}`);
          resourcesSkipped++;
          continue;
        }
        const createdResource = await cmsService.createResource(resource);
        console.log(`  ✅ Ressource créée: ${createdResource.title}`);
        resourcesCreated++;
      } catch (error: any) {
        console.error(`  ❌ Erreur avec la ressource ${resource.title}: ${error.message}`);
        resourcesSkipped++;
      }
    }

    console.log('\n✅ Seed CMS terminé avec succès !');
    console.log(`\n📊 Résumé:`);
    console.log(`   - ${createdCategories.length} catégories disponibles`);
    console.log(`   - ${createdTags.length} tags disponibles`);
    console.log(`   - ${articlesCreated} articles créés (${articlesSkipped} déjà existants)`);
    console.log(`   - ${resourcesCreated} ressources créées (${resourcesSkipped} déjà existantes)`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seedCMS()
  .then(() => {
    console.log('\n🎉 Seed terminé !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

