# Script pour créer un compte administrateur dans Strapi
# Usage: .\create-admin.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Création d'un compte administrateur Strapi" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Veuillez exécuter ce script depuis le répertoire strapi-cms" -ForegroundColor Red
    exit 1
}

# Demander les informations de l'administrateur
Write-Host "Veuillez entrer les informations pour le compte administrateur:" -ForegroundColor Yellow
Write-Host ""

$email = Read-Host "Email"
$password = Read-Host "Mot de passe" -AsSecureString
$firstname = Read-Host "Prénom"
$lastname = Read-Host "Nom"

# Convertir le mot de passe sécurisé en texte clair
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Création du compte administrateur..." -ForegroundColor Green

# Exécuter la commande Strapi pour créer l'admin
$env:EMAIL = $email
$env:PASSWORD = $plainPassword
$env:FIRSTNAME = $firstname
$env:LASTNAME = $lastname

npm run strapi admin:create-user -- --email $email --password $plainPassword --firstname $firstname --lastname $lastname

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Compte administrateur créé avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant vous connecter à l'interface d'administration avec:" -ForegroundColor Cyan
    Write-Host "  Email: $email" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Erreur lors de la création du compte administrateur" -ForegroundColor Red
    Write-Host "Assurez-vous que Strapi n'est pas en cours d'exécution" -ForegroundColor Yellow
}





