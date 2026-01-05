#!/bin/bash

# Script d'installation pour Sil Talents Tech
# Usage: ./install.sh

echo "📦 Installation de Sil Talents Tech..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Backend
echo -e "${BLUE}📦 Installation des dépendances backend...${NC}"
cd backend
npm install
cd ..

# Frontend
echo -e "${BLUE}📦 Installation des dépendances frontend...${NC}"
cd frontend
npm install
cd ..

echo ""
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo "  1. Configurez backend/.env (DB_PASSWORD, JWT_SECRET)"
echo "  2. Créez la base de données: createdb sil_talents_tech"
echo "  3. Démarrez avec ./start.sh ou manuellement"
echo ""



