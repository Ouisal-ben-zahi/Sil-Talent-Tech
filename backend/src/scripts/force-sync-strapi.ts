/**
 * Script pour forcer la synchronisation de TOUS les contenus Strapi → Supabase
 * 
 * Ce script synchronise TOUS les contenus, même s'ils existent déjà dans Supabase
 * 
 * Usage:
 * ts-node src/scripts/force-sync-strapi.ts
 * 
 * OU depuis le terminal:
 * npm run force-sync-strapi
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StrapiService } from '../strapi/strapi.service';
import { StrapiSyncService } from '../strapi-sync/strapi-sync.service';
import { SupabaseService } from '../supabase/supabase.service';

async function forceSyncStrapi() {
  console.log('\n🔄 Force Synchronisation Strapi → Supabase\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const strapiService = app.get(StrapiService);
    const strapiSyncService = app.get(StrapiSyncService);
    const supabaseService = app.get(SupabaseService);
    const client = supabaseService.getClient();

    // 1. Récupérer tous les contenus depuis Strapi
    console.log('📥 Étape 1 : Récupération des contenus depuis Strapi...\n');
    
    const articles = await strapiService.getAllArticles({ pageSize: 100 });
    console.log(`✅ ${articles.data.length} article(s) trouvé(s) dans Strapi`);
    
    const resources = await strapiService.getAllResources({ pageSize: 100 });
    console.log(`✅ ${resources.data.length} ressource(s) trouvée(s) dans Strapi`);
    
    const categories = await strapiService.getAllCategories();
    console.log(`✅ ${categories.length} catégorie(s) trouvée(s) dans Strapi`);
    
    const tags = await strapiService.getAllTags();
    console.log(`✅ ${tags.length} tag(s) trouvé(s) dans Strapi\n`);

    // 2. Synchroniser FORCEMENT tous les contenus
    console.log('🔄 Étape 2 : Synchronisation FORCÉE de tous les contenus...\n');
    
    let articlesSynced = 0;
    let resourcesSynced = 0;
    let categoriesSynced = 0;
    let tagsSynced = 0;

    // Synchroniser les catégories
    console.log('📁 Synchronisation des catégories...');
    for (const category of categories) {
      try {
        await strapiSyncService.syncCategory(category.id);
        categoriesSynced++;
        console.log(`   ✅ Catégorie "${category.name}" synchronisée`);
      } catch (error: any) {
        console.error(`   ❌ Erreur catégorie ${category.id}: ${error.message}`);
      }
    }

    // Synchroniser les tags
    console.log('\n🏷️  Synchronisation des tags...');
    for (const tag of tags) {
      try {
        await strapiSyncService.syncTag(tag.id);
        tagsSynced++;
        console.log(`   ✅ Tag "${tag.name}" synchronisé`);
      } catch (error: any) {
        console.error(`   ❌ Erreur tag ${tag.id}: ${error.message}`);
      }
    }

    // Synchroniser les articles
    console.log('\n📄 Synchronisation des articles...');
    for (const article of articles.data) {
      try {
        await strapiSyncService.syncArticle(article.id, 'entry.create');
        articlesSynced++;
        console.log(`   ✅ Article "${article.title}" synchronisé`);
      } catch (error: any) {
        console.error(`   ❌ Erreur article ${article.id}: ${error.message}`);
      }
    }

    // Synchroniser les ressources
    console.log('\n📦 Synchronisation des ressources...');
    for (const resource of resources.data) {
      try {
        await strapiSyncService.syncResource(resource.id, 'entry.create');
        resourcesSynced++;
        console.log(`   ✅ Ressource "${resource.title}" synchronisée`);
      } catch (error: any) {
        console.error(`   ❌ Erreur ressource ${resource.id}: ${error.message}`);
      }
    }

    // 3. Vérifier dans Supabase
    console.log('\n📊 Étape 3 : Vérification dans Supabase...\n');
    
    const { data: supabaseArticles } = await client
      .from('articles')
      .select('id, title')
      .limit(10);
    
    const { data: supabaseResources } = await client
      .from('resources')
      .select('id, title')
      .limit(10);
    
    const { data: supabaseCategories } = await client
      .from('categories_cms')
      .select('id, name')
      .limit(10);
    
    const { data: supabaseTags } = await client
      .from('tags')
      .select('id, name')
      .limit(10);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Synchronisation terminée !');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📊 Résumé de la synchronisation :');
    console.log(`   - Articles synchronisés : ${articlesSynced} / ${articles.data.length}`);
    console.log(`   - Ressources synchronisées : ${resourcesSynced} / ${resources.data.length}`);
    console.log(`   - Catégories synchronisées : ${categoriesSynced} / ${categories.length}`);
    console.log(`   - Tags synchronisés : ${tagsSynced} / ${tags.length}\n`);
    
    console.log('📊 Données dans Supabase après synchronisation :');
    console.log(`   - Articles dans Supabase : ${supabaseArticles?.length || 0}`);
    console.log(`   - Ressources dans Supabase : ${supabaseResources?.length || 0}`);
    console.log(`   - Catégories dans Supabase : ${supabaseCategories?.length || 0}`);
    console.log(`   - Tags dans Supabase : ${supabaseTags?.length || 0}\n`);

    if (supabaseTags && supabaseTags.length > 0) {
      console.log('📝 Tags dans Supabase :');
      supabaseTags.forEach((tag: any) => {
        console.log(`   - ${tag.name}`);
      });
      console.log('');
    }

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la synchronisation:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

forceSyncStrapi();













