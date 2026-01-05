# Script pour mettre à jour le fichier .env avec les variables Supabase

$envContent = @"
# ============================================
# CONFIGURATION SUPABASE
# ============================================
# Récupérez ces valeurs dans Supabase Dashboard:
# 1. Allez sur https://supabase.com
# 2. Sélectionnez votre projet
# 3. Settings → API
#    - Project URL → SUPABASE_URL
#    - Project API keys → anon public → SUPABASE_ANON_KEY
# 4. Settings → Database → Connection string (URI) → DATABASE_URL

# URL de votre projet Supabase (obligatoire)
# Format: https://[PROJECT-REF].supabase.co
# Exemple: https://abcdefghijklmnop.supabase.co
SUPABASE_URL=https://[PROJECT-REF].supabase.co

# Clé API anonyme Supabase (obligatoire)
# Trouvez-la dans: Settings → API → Project API keys → anon public
# Exemple: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ...
SUPABASE_ANON_KEY=your-anon-key-here

# Clé API Service Role Supabase (RECOMMANDÉ pour le backend)
# ⚠️ IMPORTANT: Cette clé bypass RLS et donne tous les accès. Ne l'exposez JAMAIS côté frontend!
# Trouvez-la dans: Settings → API → Project API keys → service_role → secret
# Le backend utilisera cette clé en priorité pour bypasser RLS
# Exemple: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjkwLCJleHAiOjE5NTQ1NDMyOTB9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# URL de connexion PostgreSQL (optionnel si SUPABASE_URL est défini)
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
# Trouvez-la dans: Settings → Database → Connection string → URI
# Remplacez [YOUR-PASSWORD] par votre mot de passe de base de données Supabase
# Remplacez [PROJECT-REF] par la référence de votre projet
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# ============================================
# CONFIGURATION JWT (AUTHENTIFICATION)
# ============================================
# Secret pour signer les tokens JWT (obligatoire)
# Générez un secret sécurisé:
#   Windows PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
#   macOS/Linux: openssl rand -base64 32
JWT_SECRET=your-secret-key-change-in-production-generate-with-openssl-rand-base64-32

# Durée de validité des tokens JWT (optionnel, défaut: 1h)
# Format: 1h (1 heure), 7d (7 jours), etc.
JWT_EXPIRES_IN=1h

# ============================================
# CONFIGURATION SERVEUR
# ============================================
# Port sur lequel le backend écoute (optionnel, défaut: 3001)
PORT=3001

# URL du frontend pour CORS (optionnel, défaut: http://localhost:3000)
FRONTEND_URL=http://localhost:3000

# URL de base de l'API pour générer les URLs de téléchargement CV (optionnel)
API_BASE_URL=http://localhost:3001

# ============================================
# CONFIGURATION UPLOAD CV
# ============================================
# Dossier pour stocker les CV uploadés (optionnel, défaut: ./cvs)
CV_UPLOAD_PATH=./cvs

# Taille maximale des fichiers CV en octets (optionnel, défaut: 20971520 = 20 Mo)
MAX_FILE_SIZE=20971520

# ============================================
# CONFIGURATION CRM (OPTIONNEL)
# ============================================
# Si vous utilisez un CRM externe (ex: Boom Manager)
# Décommentez et configurez ces variables:
# CRM_API_URL=https://your-crm-api.com
# CRM_API_KEY=your-crm-api-key

# ============================================
# CONFIGURATION ADMIN
# ============================================
# Mot de passe pour l'admin initial créé avec: npm run seed:admin
# Email par défaut: admin@sil-talents-tech.com
ADMIN_PASSWORD=Admin123!

# ============================================
# CONFIGURATION GMAIL (ENVOI D'EMAILS)
# ============================================
# Configuration pour l'envoi d'emails de réinitialisation de mot de passe
# Consultez backend/docs/CONFIGURATION_GMAIL.md pour les instructions détaillées
#
# 1. Activez la validation en deux étapes sur votre compte Google
# 2. Générez un mot de passe d'application: 
#    myaccount.google.com → Sécurité → Mots de passe des applications
# 3. Entrez votre email Gmail et le mot de passe d'application généré ci-dessous

# Email Gmail utilisé pour envoyer les emails (optionnel)
# Exemple: sil.talents.tech@gmail.com
GMAIL_USER=

# Mot de passe d'application Gmail (16 caractères, optionnel)
# ⚠️ IMPORTANT: Utilisez un mot de passe d'application, pas votre mot de passe Gmail normal!
# Exemple: abcd efgh ijkl mnop (les espaces sont optionnels)
GMAIL_APP_PASSWORD=
"@

$envPath = Join-Path $PSScriptRoot ".env"
[System.IO.File]::WriteAllText($envPath, $envContent, [System.Text.Encoding]::UTF8)
Write-Host "Fichier .env mis a jour avec succes!" -ForegroundColor Green
Write-Host "N'oubliez pas de remplacer les placeholders par vos valeurs Supabase!" -ForegroundColor Yellow

