/**
 * Script pour réinitialiser le mot de passe d'un administrateur
 * 
 * Usage:
 * ts-node src/scripts/reset-admin-password.ts <email> <nouveauMotDePasse>
 * 
 * OU depuis le terminal:
 * npm run reset:admin-password <email> <nouveauMotDePasse>
 * 
 * Exemple:
 * npm run reset:admin-password admin@sil-talents-tech.com NouveauMotDePasse123!
 */

import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetAdminPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Usage: ts-node reset-admin-password.ts <email> <nouveauMotDePasse>');
    console.error('   Exemple: ts-node reset-admin-password.ts admin@sil-talents-tech.com NouveauMotDePasse123!');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
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
    console.log(`🔍 Recherche de l'admin avec l'email: ${email}`);

    // Vérifier si l'admin existe
    const { data: existingAdmin, error: findError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !existingAdmin) {
      console.error(`❌ Aucun administrateur trouvé avec l'email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Admin trouvé: ${existingAdmin.first_name} ${existingAdmin.last_name}`);

    // Créer le hash du nouveau mot de passe
    console.log('🔐 Génération du hash du nouveau mot de passe...');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    console.log('💾 Mise à jour du mot de passe dans la base de données...');
    const { error: updateError } = await supabase
      .from('admins')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingAdmin.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Mot de passe réinitialisé avec succès !');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️  Connectez-vous avec ce nouveau mot de passe');
    console.log('⚠️  Changez-le après la première connexion pour plus de sécurité');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  }
}

resetAdminPassword();




























