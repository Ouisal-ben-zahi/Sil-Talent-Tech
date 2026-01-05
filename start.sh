#!/bin/bash

# Script de démarrage pour Sil Talents Tech
# Usage: ./start.sh

echo "🚀 Démarrage de Sil Talents Tech..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier Node.js
echo -e "${BLUE}📦 Vérification de Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Vérifier PostgreSQL
echo -e "${BLUE}🐘 Vérification de PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql non trouvé dans le PATH${NC}"
    echo -e "${YELLOW}   Ajoutez PostgreSQL au PATH ou utilisez le chemin complet${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL $(psql --version)${NC}"
fi

# Vérifier que PostgreSQL est démarré
if brew services list 2>/dev/null | grep -q "postgresql@14.*started"; then
    echo -e "${GREEN}✅ PostgreSQL est démarré${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL n'est pas démarré${NC}"
    echo -e "${YELLOW}   Démarrez avec: brew services start postgresql@14${NC}"
fi

echo ""
echo -e "${BLUE}📁 Configuration du backend...${NC}"

# Backend
cd backend

# Créer le dossier cvs s'il n'existe pas
mkdir -p cvs

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé, création depuis .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Fichier .env créé${NC}"
        echo -e "${YELLOW}⚠️  N'oubliez pas de configurer DB_PASSWORD dans backend/.env${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example non trouvé${NC}"
    fi
else
    echo -e "${GREEN}✅ Fichier .env existe${NC}"
fi

# Installer les dépendances backend si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances backend...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dépendances backend installées${NC}"
fi

echo ""
echo -e "${BLUE}📁 Configuration du frontend...${NC}"

# Frontend
cd ../frontend

# Installer les dépendances frontend si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances frontend...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dépendances frontend installées${NC}"
fi

echo ""
echo -e "${GREEN}✅ Configuration terminée !${NC}"
echo ""
echo -e "${BLUE}📋 Pour démarrer le projet :${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  npm run start:dev"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "  Backend API: http://localhost:3001/api"
echo "  Frontend:    http://localhost:3000"
echo ""



