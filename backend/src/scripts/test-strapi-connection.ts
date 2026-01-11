import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StrapiService } from '../strapi/strapi.service';

async function testStrapiConnection() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const strapiService = app.get(StrapiService);

  console.log('\n🔍 Test de connexion à Strapi...\n');

  try {
    // Test de connexion
    const isConnected = await strapiService.testConnection();
    if (isConnected) {
      console.log('✅ Connexion à Strapi réussie\n');
    } else {
      console.log('❌ Échec de la connexion à Strapi\n');
      process.exit(1);
    }

    // Test de récupération des articles
    console.log('📄 Test de récupération des articles...');
    const articles = await strapiService.getAllArticles({ pageSize: 5 });
    console.log(`✅ ${articles.data.length} article(s) récupéré(s)\n`);

    // Test de récupération des ressources
    console.log('📦 Test de récupération des ressources...');
    const resources = await strapiService.getAllResources({ pageSize: 5 });
    console.log(`✅ ${resources.data.length} ressource(s) récupérée(s)\n`);

    // Test de récupération des catégories
    console.log('🏷️  Test de récupération des catégories...');
    const categories = await strapiService.getAllCategories();
    console.log(`✅ ${categories.length} catégorie(s) récupérée(s)\n`);

    // Test de récupération des tags
    console.log('🔖 Test de récupération des tags...');
    const tags = await strapiService.getAllTags();
    console.log(`✅ ${tags.length} tag(s) récupéré(s)\n`);

    console.log('✅ Tous les tests sont passés avec succès!\n');
  } catch (error: any) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

testStrapiConnection();

















