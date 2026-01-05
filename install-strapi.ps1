# Script d'installation de Strapi v4
Write-Host "🚀 Installation de Strapi v4..." -ForegroundColor Cyan

# Vérifier Node.js
Write-Host "`n📋 Vérification des prérequis..." -ForegroundColor Yellow
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm: $npmVersion" -ForegroundColor Green

# Créer le dossier strapi-cms s'il n'existe pas
if (-not (Test-Path "strapi-cms")) {
    Write-Host "`n📁 Création du dossier strapi-cms..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "strapi-cms" | Out-Null
}

Set-Location strapi-cms

# Vérifier si Strapi est déjà installé
if (Test-Path "package.json") {
    Write-Host "`n⚠️  Strapi semble déjà installé dans ce dossier." -ForegroundColor Yellow
    Write-Host "Voulez-vous réinstaller ? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "Installation annulée." -ForegroundColor Red
        Set-Location ..
        exit
    }
    Write-Host "`n🗑️  Suppression de l'installation existante..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules, .cache, build -ErrorAction SilentlyContinue
}

Write-Host "`n📦 Installation de Strapi avec SQLite (quickstart)..." -ForegroundColor Yellow
Write-Host "Cette installation utilisera SQLite pour le développement." -ForegroundColor Gray
Write-Host "Vous pourrez changer pour PostgreSQL plus tard si nécessaire." -ForegroundColor Gray

# Installer Strapi avec quickstart (SQLite)
# Note: L'option --quickstart utilise SQLite par défaut
npx create-strapi-app@latest . --quickstart --skip-cloud

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Strapi installé avec succès !" -ForegroundColor Green
    Write-Host "`n📝 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Démarrer Strapi: npm run develop" -ForegroundColor White
    Write-Host "2. Ouvrir http://localhost:1337/admin" -ForegroundColor White
    Write-Host "3. Créer votre premier compte admin" -ForegroundColor White
    Write-Host "`n💡 Pour démarrer maintenant, exécutez:" -ForegroundColor Yellow
    Write-Host "   cd strapi-cms" -ForegroundColor White
    Write-Host "   npm run develop" -ForegroundColor White
} else {
    Write-Host "`n❌ Erreur lors de l'installation de Strapi" -ForegroundColor Red
    Write-Host "Vérifiez les erreurs ci-dessus." -ForegroundColor Yellow
}

Set-Location ..













