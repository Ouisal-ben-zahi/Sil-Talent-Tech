#!/usr/bin/env node

/**
 * Script de vérification de la configuration pour les collaborateurs
 * 
 * Usage: node check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration...\n');

let errors = [];
let warnings = [];
let success = [];

// Vérifier Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  errors.push(`Node.js version ${nodeVersion} détectée. Version 18+ requise.`);
} else {
  success.push(`✅ Node.js version ${nodeVersion} OK`);
}

// Vérifier que .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  errors.push('❌ Fichier .env manquant. Copiez .env.example vers .env');
} else {
  success.push('✅ Fichier .env existe');
  
  // Lire et vérifier les variables importantes
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
  
  // Vérifier SUPABASE_URL
  if (!envVars.SUPABASE_URL || envVars.SUPABASE_URL === '' || envVars.SUPABASE_URL.includes('[PROJECT-REF]')) {
    errors.push('❌ SUPABASE_URL non configuré ou invalide dans .env');
  } else {
    success.push('✅ SUPABASE_URL configuré');
  }
  
  // Vérifier SUPABASE_ANON_KEY
  if (!envVars.SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY === '' || envVars.SUPABASE_ANON_KEY.includes('your-anon-key')) {
    errors.push('❌ SUPABASE_ANON_KEY non configuré ou invalide dans .env');
  } else {
    success.push('✅ SUPABASE_ANON_KEY configuré');
  }
  
  // Vérifier JWT_SECRET
  if (!envVars.JWT_SECRET || envVars.JWT_SECRET === '' || envVars.JWT_SECRET.includes('changez-moi')) {
    warnings.push('⚠️  JWT_SECRET utilise la valeur par défaut. Changez-la en production.');
  } else {
    success.push('✅ JWT_SECRET configuré');
  }
  
  // Vérifier PORT
  if (!envVars.PORT) {
    warnings.push('⚠️  PORT non défini, utilisera 3001 par défaut');
  } else {
    success.push(`✅ PORT configuré: ${envVars.PORT}`);
  }
}

// Vérifier que node_modules existe
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  errors.push('❌ node_modules manquant. Exécutez: npm install');
} else {
  success.push('✅ node_modules existe');
}

// Vérifier que le dossier cvs existe
const cvsPath = path.join(__dirname, 'cvs');
if (!fs.existsSync(cvsPath)) {
  warnings.push('⚠️  Dossier cvs/ manquant. Créez-le avec: mkdir -p cvs');
} else {
  success.push('✅ Dossier cvs/ existe');
}

// Vérifier que package.json existe
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  errors.push('❌ package.json manquant');
} else {
  success.push('✅ package.json existe');
}

// Afficher les résultats
console.log('📊 Résultats:\n');

if (success.length > 0) {
  console.log('✅ Succès:');
  success.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  Avertissements:');
  warnings.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Erreurs:');
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log('');
  console.log('💡 Actions à effectuer:');
  console.log('   1. Copiez .env.example vers .env: cp .env.example .env');
  console.log('   2. Configurez SUPABASE_URL et SUPABASE_ANON_KEY dans .env');
  console.log('   3. Installez les dépendances: npm install');
  console.log('   4. Créez le dossier cvs: mkdir -p cvs');
  console.log('');
  process.exit(1);
} else {
  console.log('✅ Configuration OK ! Vous pouvez démarrer avec: npm run start:dev\n');
  process.exit(0);
}
