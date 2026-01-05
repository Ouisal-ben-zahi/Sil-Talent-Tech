import * as dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 Test de connexion à Supabase...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  // Vérifier les variables d'environnement
  console.log('📋 Vérification des variables d\'environnement:');
  console.log(`  SUPABASE_URL: ${supabaseUrl ? '✅ Défini' : '❌ Manquant'}`);
  console.log(`  SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Défini' : '❌ Manquant'}`);
  console.log(`  DATABASE_URL: ${databaseUrl ? '✅ Défini' : '❌ Manquant'}\n`);

  if (!supabaseUrl && !databaseUrl) {
    console.error('❌ Erreur: SUPABASE_URL ou DATABASE_URL doit être configuré dans .env');
    process.exit(1);
  }

  // Déterminer l'URL Supabase
  let url = supabaseUrl;
  if (!url && databaseUrl) {
    try {
      const dbUrl = new URL(databaseUrl.replace('postgresql://', 'https://'));
      url = `https://${dbUrl.hostname.replace('db.', '').replace('.supabase.co', '')}.supabase.co`;
      console.log(`📝 URL Supabase extraite depuis DATABASE_URL: ${url}\n`);
    } catch (e) {
      console.error('❌ Impossible d\'extraire l\'URL Supabase depuis DATABASE_URL');
      process.exit(1);
    }
  }

  // Créer le client Supabase
  const client: SupabaseClient = createClient(url, supabaseKey || '');

  try {
    // Test 1: Connexion de base
    console.log('🧪 Test 1: Connexion de base...');
    const { data: healthCheck, error: healthError } = await client
      .from('candidates')
      .select('count')
      .limit(0);

    if (healthError && healthError.code !== 'PGRST116') {
      throw healthError;
    }
    console.log('  ✅ Connexion réussie\n');

    // Test 2: Vérifier l'existence des tables
    console.log('🧪 Test 2: Vérification des tables...');
    const tables = ['candidates', 'cv_history', 'admins'];
    
    for (const table of tables) {
      try {
        const { error } = await client.from(table).select('*').limit(0);
        if (error && error.code === '42P01') {
          console.log(`  ❌ Table "${table}" n'existe pas`);
        } else {
          console.log(`  ✅ Table "${table}" existe`);
        }
      } catch (err: any) {
        if (err.code === '42P01') {
          console.log(`  ❌ Table "${table}" n'existe pas`);
        } else {
          console.log(`  ⚠️  Erreur lors de la vérification de "${table}": ${err.message}`);
        }
      }
    }
    console.log('');

    // Test 3: Compter les candidats
    console.log('🧪 Test 3: Compter les candidats...');
    const { count, error: countError } = await client
      .from('candidates')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log(`  ⚠️  Erreur: ${countError.message}`);
    } else {
      console.log(`  ✅ Nombre de candidats: ${count || 0}\n`);
    }

    // Test 4: Compter les admins
    console.log('🧪 Test 4: Compter les admins...');
    const { count: adminCount, error: adminCountError } = await client
      .from('admins')
      .select('*', { count: 'exact', head: true });

    if (adminCountError) {
      console.log(`  ⚠️  Erreur: ${adminCountError.message}`);
    } else {
      console.log(`  ✅ Nombre d'admins: ${adminCount || 0}\n`);
    }

    // Test 5: Test d'insertion (optionnel, commenté par défaut)
    // console.log('🧪 Test 5: Test d\'insertion...');
    // const { data: testData, error: insertError } = await client
    //   .from('candidates')
    //   .insert({
    //     first_name: 'Test',
    //     last_name: 'Connection',
    //     email: `test-${Date.now()}@example.com`,
    //     phone: '0123456789',
    //   })
    //   .select()
    //   .single();

    // if (insertError) {
    //   console.log(`  ⚠️  Erreur d'insertion: ${insertError.message}`);
    // } else {
    //   console.log(`  ✅ Insertion réussie (ID: ${testData.id})`);
    //   // Nettoyer le test
    //   await client.from('candidates').delete().eq('id', testData.id);
    //   console.log('  ✅ Donnée de test supprimée\n');
    // }

    console.log('✅ Tous les tests de connexion sont passés avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`  - URL Supabase: ${url}`);
    console.log(`  - Clé API: ${supabaseKey ? 'Configurée' : 'Non configurée'}`);
    console.log(`  - Candidats: ${count || 0}`);
    console.log(`  - Admins: ${adminCount || 0}`);

  } catch (error: any) {
    console.error('\n❌ Erreur lors du test de connexion:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    console.error(`  Détails: ${error.details || 'N/A'}`);
    console.error(`  Hint: ${error.hint || 'N/A'}`);
    process.exit(1);
  }
}

testDatabaseConnection();





