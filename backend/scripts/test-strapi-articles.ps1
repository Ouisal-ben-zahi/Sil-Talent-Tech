# Script PowerShell pour tester la récupération d'articles depuis Strapi

Write-Host "`n🔍 Test de récupération des articles depuis Strapi...`n" -ForegroundColor Cyan

# Récupérer le token depuis .env
$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Fichier .env non trouvé dans backend/" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile -Raw
$tokenMatch = [regex]::Match($envContent, 'STRAPI_API_TOKEN=(.+)')
if (-not $tokenMatch.Success) {
    Write-Host "❌ STRAPI_API_TOKEN non trouvé dans .env" -ForegroundColor Red
    exit 1
}

$token = $tokenMatch.Groups[1].Value.Trim()
$strapiUrl = "http://localhost:1337"

Write-Host "📡 URL Strapi : $strapiUrl" -ForegroundColor Yellow
Write-Host "🔑 Token : $($token.Substring(0, 20))..." -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $token"
}

# Test 1 : Vérifier la connexion
Write-Host "1️⃣ Test de connexion à Strapi..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$strapiUrl/api" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Connexion réussie" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur de connexion : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Vérifiez que Strapi est démarré sur http://localhost:1337" -ForegroundColor Yellow
    exit 1
}

# Test 2 : Récupérer TOUS les articles (sans filtre)
Write-Host "`n2️⃣ Récupération de TOUS les articles (draft + published)..." -ForegroundColor Cyan
try {
    $articles = Invoke-RestMethod -Uri "$strapiUrl/api/articles?pagination[pageSize]=100" -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "   📊 Total articles trouvés : $($articles.data.Count)" -ForegroundColor $(if ($articles.data.Count -gt 0) { "Green" } else { "Yellow" })
    
    if ($articles.data.Count -eq 0) {
        Write-Host "`n   ⚠️ Aucun article trouvé !" -ForegroundColor Red
        Write-Host "`n   💡 Vérifications à faire :" -ForegroundColor Yellow
        Write-Host "      1. Allez dans Strapi Admin → Content Manager → Article" -ForegroundColor White
        Write-Host "      2. Vérifiez qu'un article existe dans la liste" -ForegroundColor White
        Write-Host "      3. Si aucun article : Créez-en un nouveau" -ForegroundColor White
        Write-Host "      4. Ouvrez l'article et vérifiez StatuS = published" -ForegroundColor White
        Write-Host "      5. Cliquez sur 'Publish' (pas seulement 'Save')" -ForegroundColor White
    } else {
        Write-Host "`n   📝 Détails des articles :`n" -ForegroundColor Green
        $articles.data | ForEach-Object { 
            $status = $_.attributes.status
            if (-not $status) {
                $status = $_.attributes.StatuS
            }
            if (-not $status) {
                $status = "non défini"
            }
            
            $statusColor = if ($status -eq "published") { "Green" } elseif ($status -eq "draft") { "Yellow" } else { "Red" }
            
            Write-Host "      ID: $($_.id)" -ForegroundColor Cyan
            Write-Host "      Title: $($_.attributes.title)" -ForegroundColor White
            Write-Host "      Slug: $($_.attributes.slug)" -ForegroundColor Gray
            Write-Host "      StatuS: $status" -ForegroundColor $statusColor
            Write-Host ""
        }
    }
} catch {
    Write-Host "   ❌ Erreur lors de la récupération : $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "`n   💡 Erreur 403 : Permissions insuffisantes" -ForegroundColor Yellow
        Write-Host "      → Allez dans Settings → Users & Permissions → Roles → Public" -ForegroundColor White
        Write-Host "      → Trouvez 'Article' et activez 'find' et 'findOne'" -ForegroundColor White
        Write-Host "      → Cliquez sur 'Save'" -ForegroundColor White
    } elseif ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "`n   💡 Erreur 401 : Token invalide ou expiré" -ForegroundColor Yellow
        Write-Host "      → Vérifiez STRAPI_API_TOKEN dans backend/.env" -ForegroundColor White
        Write-Host "      → Recréez un token dans Settings → API Tokens" -ForegroundColor White
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "`n   💡 Erreur 404 : Le Content-Type 'Article' n'existe peut-être pas" -ForegroundColor Yellow
        Write-Host "      → Vérifiez dans Content-Type Builder que 'Article' existe" -ForegroundColor White
    }
}

# Test 3 : Vérifier les permissions publiques
Write-Host "`n3️⃣ Test des permissions publiques (sans token)..." -ForegroundColor Cyan
try {
    $publicArticles = Invoke-RestMethod -Uri "$strapiUrl/api/articles?pagination[pageSize]=1" -Method GET -ErrorAction Stop
    Write-Host "   ⚠️ Les articles sont accessibles sans authentification" -ForegroundColor Yellow
    Write-Host "   💡 C'est normal si les permissions publiques sont activées" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "   ✅ Les articles nécessitent une authentification (sécurisé)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Erreur : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 4 : Récupérer seulement les articles publiés
Write-Host "`n4️⃣ Récupération des articles publiés (StatuS = published)..." -ForegroundColor Cyan
try {
    $publishedArticles = Invoke-RestMethod -Uri "$strapiUrl/api/articles?filters[StatuS][`$eq]=published&pagination[pageSize]=100" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   📊 Articles publiés trouvés : $($publishedArticles.data.Count)" -ForegroundColor $(if ($publishedArticles.data.Count -gt 0) { "Green" } else { "Yellow" })
    
    if ($publishedArticles.data.Count -eq 0 -and $articles.data.Count -gt 0) {
        Write-Host "`n   💡 Vous avez des articles mais aucun n'est publié !" -ForegroundColor Yellow
        Write-Host "      → Ouvrez vos articles dans Content Manager" -ForegroundColor White
        Write-Host "      → Changez StatuS à 'published'" -ForegroundColor White
        Write-Host "      → Cliquez sur 'Publish'" -ForegroundColor White
    }
} catch {
    Write-Host "   ⚠️ Erreur : $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n✅ Tests terminés`n" -ForegroundColor Green

















