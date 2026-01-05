import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';
import { SupabaseService } from '../supabase/supabase.service';
import { ContactService } from '../contact/contact.service';

async function testContactEndpoint() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const supabaseService = app.get(SupabaseService);
  const contactService = app.get(ContactService);

  console.log('\n🧪 Test du endpoint Contact\n');

  // 1. Vérifier la configuration
  console.log('1️⃣ Vérification de la configuration...');
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const supabaseServiceKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAnonKey = configService.get<string>('SUPABASE_ANON_KEY');

  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL n\'est pas configuré dans .env');
    process.exit(1);
  }
  console.log('✅ SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...');

  if (!supabaseServiceKey && !supabaseAnonKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY doit être configuré');
    process.exit(1);
  }

  if (supabaseServiceKey) {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY est configuré (recommandé)');
  } else {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY n\'est pas configuré. Utilisation de SUPABASE_ANON_KEY (peut causer des erreurs RLS)');
  }

  // 2. Vérifier la connexion Supabase
  console.log('\n2️⃣ Test de connexion Supabase...');
  try {
    const client = supabaseService.getClient();
    const { data: healthCheck, error: healthError } = await client
      .from('contact_messages')
      .select('id')
      .limit(0);

    if (healthError && healthError.code !== 'PGRST116') {
      throw healthError;
    }
    console.log('✅ Connexion Supabase réussie');
  } catch (error: any) {
    console.error('❌ Erreur de connexion Supabase:', error.message);
    if (error.message.includes('row-level security')) {
      console.error('💡 Solution: Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env');
    }
    process.exit(1);
  }

  // 3. Vérifier que la table existe
  console.log('\n3️⃣ Vérification de la table contact_messages...');
  try {
    const { count, error } = await supabaseService.getClient()
      .from('contact_messages')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ La table contact_messages n\'existe pas');
        console.error('💡 Solution: Exécutez le script SQL supabase-contact-table-FINAL.sql dans Supabase');
      } else {
        console.error('❌ Erreur:', error.message);
      }
      process.exit(1);
    }
    console.log(`✅ Table contact_messages existe (${count} messages)`);
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }

  // 4. Tester l'insertion
  console.log('\n4️⃣ Test d\'insertion d\'un message de contact...');
  try {
    const testMessage = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test Message - Ceci est un test automatique',
    };

    const result = await contactService.sendContactMessage(testMessage);
    console.log('✅ Message de contact inséré avec succès!');
    console.log('   ID:', result.messageId);
    console.log('   Message:', result.message);
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'insertion:', error.message);
    if (error.message.includes('row-level security')) {
      console.error('💡 Solution: Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env et redémarrez le backend');
    }
    process.exit(1);
  }

  console.log('\n🎉 Tous les tests sont passés! Le endpoint contact est correctement configuré.\n');
  await app.close();
}

testContactEndpoint().catch((error) => {
  console.error('❌ Erreur inattendue:', error);
  process.exit(1);
});





