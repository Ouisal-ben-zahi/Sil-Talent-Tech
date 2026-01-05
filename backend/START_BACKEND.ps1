# Script PowerShell pour démarrer le backend
# Double-cliquez sur ce fichier ou exécutez: .\START_BACKEND.ps1

Write-Host "🚀 Démarrage du backend..." -ForegroundColor Green
Write-Host ""

# Aller dans le dossier backend
Set-Location -Path "$PSScriptRoot"

# Vérifier que node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules n'existe pas. Installation des dépendances..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Vérifier que .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env n'existe pas. Création du fichier..." -ForegroundColor Yellow
    Write-Host "💡 Exécutez update-env.ps1 pour créer le fichier .env" -ForegroundColor Yellow
    Write-Host ""
}

# Démarrer le backend
Write-Host "✅ Démarrage du serveur backend..." -ForegroundColor Green
Write-Host "📍 Le backend sera accessible sur: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "⚠️  Ne fermez pas cette fenêtre !" -ForegroundColor Yellow
Write-Host ""

npm run dev





