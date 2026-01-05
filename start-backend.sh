#!/bin/bash

# Script pour démarrer uniquement le backend
# Usage: ./start-backend.sh

echo "🚀 Démarrage du backend..."

cd backend

# Vérifier que .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé !"
    echo "   Créez-le depuis .env.example et configurez-le."
    exit 1
fi

# Créer le dossier cvs s'il n'existe pas
mkdir -p cvs

# Démarrer
npm run start:dev



