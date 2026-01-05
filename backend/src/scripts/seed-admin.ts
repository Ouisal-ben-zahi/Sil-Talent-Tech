/**
 * Script pour créer un administrateur initial avec Supabase
 * 
 * Usage:
 * ts-node src/scripts/seed-admin.ts
 * 
 * OU depuis le terminal:
 * npm run seed:admin
 */

import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { AdminRole } from '../common/types/database.types';

dotenv.config();

async function seedAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl && !databaseUrl) {
    console.error('❌ SUPABASE_URL ou DATABASE_URL doit être configuré dans .env');
    process.exit(1);
  }

  // Extraire l'URL Supabase depuis DATABASE_URL si nécessaire
  let url = supabaseUrl;
  if (!url && databaseUrl) {
    try {
      const dbUrl = new URL(databaseUrl.replace('postgresql://', 'https://'));
      url = `https://${dbUrl.hostname.replace('db.', '').replace('.supabase.co', '')}.supabase.co`;
    } catch (e) {
      console.error('❌ Impossible d\'extraire l\'URL Supabase depuis DATABASE_URL');
      process.exit(1);
    }
  }

  const key = supabaseKey || '';
  const supabase = createClient(url!, key);

  try {
    console.log('✅ Connexion à Supabase réussie');

    // Vérifier si un admin existe déjà
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@sil-talents-tech.com')
      .single();

    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà avec cet email');
      return;
    }

    // Créer le mot de passe hashé
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'admin
    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        email: 'admin@sil-talents-tech.com',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'Sil Talents Tech',
        role: AdminRole.SUPER_ADMIN,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Administrateur créé avec succès !');
    console.log('📧 Email: admin@sil-talents-tech.com');
    console.log('🔑 Mot de passe: ' + password);
    console.log('⚠️  Changez ce mot de passe après la première connexion !');
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

seedAdmin();
