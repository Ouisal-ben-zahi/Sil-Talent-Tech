/**
 * Script pour tester la connexion et la synchronisation Strapi → Supabase
 * 
 * Usage:
 * ts-node src/scripts/test-strapi-supabase-sync.ts
 * 
 * OU depuis le terminal:
 * npm run test:strapi-sync
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StrapiService } from '../strapi/strapi.service';
import { StrapiSyncService } from '../strapi-sync/strapi-sync.service';
import { SupabaseService } from '../supabase/supabase.service';

async function testStrapiSupabaseSync() {
  console.log('\n🔍 Test de connexion et synchronisation Strapi → Supabase\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // 1. Test de connexion à Strapi
    console.log('📡 Étape 1 : Test de connexion à Strapi...\n');
    const strapiService = app.get(StrapiService);
    
    const isStrapiConnected = await strapiService.testConnection();
    if (!isStrapiConnected) {
      console.error('❌ Échec de la connexion à Strapi');
      console.error('💡 Vérifiez que :');
      console.error('   - Strapi est démarré (http://localhost:1337)');
      console.error('   - STRAPI_URL est correct dans .env');
      console.error('   - STRAPI_API_TOKEN est configuré dans .env');
      process.exit(1);
    }
    console.log('✅ Connexion à Strapi réussie\n');

    // 2. Test de récupération des données depuis Strapi
    console.log('📥 Étape 2 : Test de récupération des données depuis Strapi...\n');
    
    // Récupérer TOUS les articles (sans filtre de statut pour voir draft + published)
    const articles = await strapiService.getAllArticles({ pageSize: 100 });
    console.log(`✅ ${articles.data.length} article(s) récupéré(s) depuis Strapi`);
    
    if (articles.data.length > 0) {
      console.log('📝 Articles trouvés :');
      articles.data.forEach((article: any) => {
        const status = article.status || article.StatuS || 'non défini';
        console.log(`   - "${article.title}" (Status: ${status})`);
      });
    } else {
      console.log('💡 Aucun article trouvé. Vérifiez que :');
      console.log('   1. Vous avez créé un article dans Strapi (Content Manager)');
      console.log('   2. L\'article a StatuS = published (pas draft)');
      console.log('   3. L\'article a été publié (bouton "Publish" cliqué)');
      console.log('   4. Les permissions sont configurées (Public → Article → find, findOne)');
    }
    
    const resources = await strapiService.getAllResources({ pageSize: 5 });
    console.log(`✅ ${resources.data.length} ressource(s) récupérée(s) depuis Strapi`);
    
    const categories = await strapiService.getAllCategories();
    console.log(`✅ ${categories.length} catégorie(s) récupérée(s) depuis Strapi`);
    
    const tags = await strapiService.getAllTags();
    console.log(`✅ ${tags.length} tag(s) récupéré(s) depuis Strapi\n`);

    // 3. Test de connexion à Supabase
    console.log('🗄️  Étape 3 : Test de connexion à Supabase...\n');
    const supabaseService = app.get(SupabaseService);
    const supabaseClient = supabaseService.getClient();
    
    // Tester la connexion en récupérant les catégories
    const { data: supabaseCategories, error: supabaseError } = await supabaseClient
      .from('categories_cms')
      .select('id, name')
      .limit(5);
    
    if (supabaseError) {
      console.error('❌ Erreur de connexion à Supabase:', supabaseError.message);
      console.error('💡 Vérifiez que :');
      console.error('   - SUPABASE_URL est correct dans .env');
      console.error('   - SUPABASE_SERVICE_ROLE_KEY est configuré dans .env');
      console.error('   - Les tables CMS existent dans Supabase');
      process.exit(1);
    }
    console.log(`✅ Connexion à Supabase réussie`);
    console.log(`✅ ${supabaseCategories?.length || 0} catégorie(s) trouvée(s) dans Supabase\n`);

    // 4. Synchronisation complète de tous les contenus
    console.log('🔄 Étape 4 : Synchronisation complète Strapi → Supabase...\n');
    const strapiSyncService = app.get(StrapiSyncService);
    
    try {
      console.log('🔄 Début de la synchronisation complète...\n');
      const syncResult = await strapiSyncService.syncAll();
      
      console.log('\n✅ Synchronisation complète terminée !');
      console.log(`   - Articles synchronisés : ${syncResult.articles}`);
      console.log(`   - Ressources synchronisées : ${syncResult.resources}`);
      console.log(`   - Catégories synchronisées : ${syncResult.categories}`);
      console.log(`   - Tags synchronisés : ${syncResult.tags}\n`);
    } catch (error: any) {
      console.error(`❌ Erreur lors de la synchronisation complète:`, error.message);
      console.error('💡 Vérifiez les logs ci-dessus pour plus de détails\n');
    }

    // 5. Vérifier les données dans Supabase après synchronisation
    console.log('📊 Étape 5 : Vérification des données dans Supabase...\n');
    
    const { data: supabaseTags, error: tagsError } = await supabaseClient
      .from('tags')
      .select('id, name, slug')
      .limit(10);
    
    const { data: supabaseArticles, error: articlesError } = await supabaseClient
      .from('articles')
      .select('id, title, status')
      .limit(10);
    
    const { data: supabaseResources, error: resourcesError } = await supabaseClient
      .from('resources')
      .select('id, title, type')
      .limit(10);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Tous les tests sont passés avec succès !');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📊 Résumé :');
    console.log(`   - Strapi : ✅ Connecté`);
    console.log(`   - Supabase : ✅ Connecté`);
    console.log(`   - Articles Strapi : ${articles.data.length} → Supabase : ${supabaseArticles?.length || 0}`);
    console.log(`   - Ressources Strapi : ${resources.data.length} → Supabase : ${supabaseResources?.length || 0}`);
    console.log(`   - Catégories Strapi : ${categories.length} → Supabase : ${supabaseCategories?.length || 0}`);
    console.log(`   - Tags Strapi : ${tags.length} → Supabase : ${supabaseTags?.length || 0}\n`);
    
    if (supabaseTags && supabaseTags.length > 0) {
      console.log('📝 Tags dans Supabase :');
      supabaseTags.forEach((tag: any) => {
        console.log(`   - ${tag.name} (slug: ${tag.slug})`);
      });
      console.log('');
    }
    
    if (tagsError) {
      console.warn(`⚠️  Erreur lors de la récupération des tags depuis Supabase:`, tagsError.message);
      console.warn('💡 Vérifiez que la table "tags" existe dans Supabase\n');
    }

    console.log('💡 Prochaines étapes :');
    console.log('   1. Créez des articles et ressources dans Strapi');
    console.log('   2. Configurez les webhooks dans Strapi');
    console.log('   3. Testez la synchronisation automatique\n');

  } catch (error: any) {
    console.error('\n❌ Erreur lors des tests:', error.message);
    console.error('\n💡 Vérifiez :');
    console.error('   - Que Strapi est démarré');
    console.error('   - Que les variables d\'environnement sont correctes');
    console.error('   - Que les tables existent dans Supabase');
    console.error('\n📚 Documentation :');
    console.error('   - backend/docs/STRAPI_SYNC_SETUP.md');
    console.error('   - backend/docs/STRAPI_MODELS_SETUP.md\n');
    process.exit(1);
  } finally {
    await app.close();
  }
}

testStrapiSupabaseSync();

