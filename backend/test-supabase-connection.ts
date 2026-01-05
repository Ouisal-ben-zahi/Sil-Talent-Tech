/**
 * Script de test pour vérifier la connexion à Supabase
 * 
 * Usage: npx ts-node test-supabase-connection.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// Charger les variables d'environnement
config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Test de connexion Supabase...\n');
console.log('URL:', supabaseUrl ? supabaseUrl.substring(0, 40) + '...' : 'NON DÉFINIE');
console.log('Clé API:', supabaseKey ? 'DÉFINIE (' + supabaseKey.substring(0, 20) + '...)' : 'NON DÉFINIE\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_ANON_KEY manquant dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Vérifier que la table candidates existe
    console.log('📋 Test 1: Vérification de la table candidates...');
    const { data: tables, error: tablesError } = await supabase
      .from('candidates')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ Erreur:', tablesError.message);
      console.error('   Code:', tablesError.code);
      console.error('   Détails:', tablesError.details);
      console.error('   Hint:', tablesError.hint);
      
      if (tablesError.code === '42P01') {
        console.error('\n⚠️  La table "candidates" n\'existe pas !');
        console.error('   → Exécutez le script supabase-schema.sql dans Supabase SQL Editor');
      }
      
      if (tablesError.message.includes('row-level security')) {
        console.error('\n⚠️  Row Level Security (RLS) bloque l\'accès !');
        console.error('   → Désactivez temporairement RLS dans Supabase Table Editor');
      }
      
      return;
    }

    console.log('✅ Table candidates accessible\n');

    // Test 2: Tenter d'insérer un candidat de test
    console.log('📝 Test 2: Tentative d\'insertion d\'un candidat de test...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: insertData, error: insertError } = await supabase
      .from('candidates')
      .insert({
        first_name: 'Test',
        last_name: 'User',
        email: testEmail,
        phone: '0123456789',
        source: 'quick_application',
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion:', insertError.message);
      console.error('   Code:', insertError.code);
      console.error('   Détails:', insertError.details);
      console.error('   Hint:', insertError.hint);
      
      if (insertError.message.includes('row-level security')) {
        console.error('\n⚠️  Row Level Security (RLS) bloque l\'insertion !');
        console.error('   → Désactivez temporairement RLS dans Supabase Table Editor');
        console.error('   → Ou créez une politique RLS appropriée');
      }
      
      return;
    }

    console.log('✅ Candidat de test créé avec succès !');
    console.log('   ID:', insertData.id);
    console.log('   Email:', insertData.email);

    // Test 3: Supprimer le candidat de test
    console.log('\n🗑️  Test 3: Suppression du candidat de test...');
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.error('⚠️  Erreur lors de la suppression:', deleteError.message);
    } else {
      console.log('✅ Candidat de test supprimé');
    }

    console.log('\n✅ Tous les tests sont passés ! La connexion Supabase fonctionne correctement.');

  } catch (error: any) {
    console.error('❌ Erreur inattendue:', error.message);
    console.error(error);
  }
}

testConnection();
