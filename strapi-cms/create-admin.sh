#!/bin/bash

# Script pour créer un compte administrateur dans Strapi
# Usage: ./create-admin.sh

echo "========================================"
echo "Création d'un compte administrateur Strapi"
echo "========================================"
echo ""

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "Erreur: Veuillez exécuter ce script depuis le répertoire strapi-cms"
    exit 1
fi

# Demander les informations de l'administrateur
echo "Veuillez entrer les informations pour le compte administrateur:"
echo ""

read -p "Email: " email
read -sp "Mot de passe: " password
echo ""
read -p "Prénom: " firstname
read -p "Nom: " lastname

echo ""
echo "Création du compte administrateur..."

# Exécuter la commande Strapi pour créer l'admin
npm run strapi admin:create-user -- --email "$email" --password "$password" --firstname "$firstname" --lastname "$lastname"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Compte administrateur créé avec succès!"
    echo ""
    echo "Vous pouvez maintenant vous connecter à l'interface d'administration avec:"
    echo "  Email: $email"
    echo ""
else
    echo ""
    echo "✗ Erreur lors de la création du compte administrateur"
    echo "Assurez-vous que Strapi n'est pas en cours d'exécution"
fi








