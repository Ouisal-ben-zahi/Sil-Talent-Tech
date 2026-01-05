# Sil Talents Tech - Plateforme Premium

Plateforme professionnelle de recrutement tech avec portail candidat, intégration CRM et back-office.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (React + TypeScript)
- **Backend**: NestJS (Node.js + TypeScript)
- **Base de données**: PostgreSQL
- **CMS**: Strapi
- **Hébergement**: Hostinger

## 📁 Structure du Projet

```
sil-tech/
├── frontend/          # Next.js 14 Application
├── backend/           # NestJS API
├── docs/              # Documentation
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+ (voir `INSTALLATION_POSTGRESQL.md`)
- Homebrew (macOS, voir `INSTALLATION_HOMEBREW.md`)

### Démarrage Rapide

**Option 1 : Scripts automatiques (recommandé)**
```bash
# Installer les dépendances
./install.sh

# Démarrer le backend (Terminal 1)
./start-backend.sh

# Démarrer le frontend (Terminal 2)
./start-frontend.sh
```

**Option 2 : Commandes manuelles**
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

> ✅ **Tout est configuré !** Voir `TOUT_EST_PRET.md`  
> ⚡ **Guide rapide :** Voir `DEMARRAGE_RAPIDE.md`  
> 📖 **Guide complet :** Voir `PROCHAINES_ETAPES.md`

## 🎨 Design System

- **Gris foncé**: #2A2A2A
- **Gris clair**: #D9D9D9
- **Noir**: #000000
- **Blanc**: #FFFFFF
- **Accent Bleu**: #297BFF

## 📋 Fonctionnalités

### Frontend
- ✅ Site corporate premium (Accueil, À propos, Services, Contact)
- ✅ Portail candidat complet (Inscription, Connexion, Dashboard)
- ✅ Candidature rapide (sans compte)
- ✅ Back-office admin (Dashboard, Liste candidats, Statistiques)
- ✅ Pages légales (RGPD, Mentions légales, CGU)
- ✅ Design system premium avec animations

### Backend
- ✅ API REST complète (NestJS)
- ✅ Authentification JWT sécurisée
- ✅ Upload sécurisé des CV (PDF, validation)
- ✅ Intégration CRM Boom Manager avec retry automatique
- ✅ Gestion complète des candidats et CV
- ✅ Statistiques et monitoring

## 🔒 Sécurité

- ✅ HTTPS (en production)
- ✅ Rate Limiting (10 req/min)
- ✅ Validation des données (class-validator)
- ✅ Hashage mots de passe (bcrypt)
- ✅ JWT sécurisés avec expiration
- ✅ Routes admin protégées (AdminGuard)
- ✅ CORS configuré
- ✅ Helmet pour headers sécurisés

## 📚 Documentation

### 🚀 Démarrage Rapide
- `DEMARRAGE_RAPIDE.md` - **Commandes pour démarrer maintenant** ⚡
- `INSTALLATION_COMPLETE.md` - **Guide pas à pas complet** ⭐
- `INSTALLATION_HOMEBREW.md` - **Installation Homebrew** 🍺
- `INSTALLATION_POSTGRESQL.md` - **Installation PostgreSQL** 🐘
- `FIX_PATH_POSTGRESQL.md` - **Corriger le PATH PostgreSQL** 🔧
- `GUIDE_DEMARRAGE_LOCAL.md` - Guide complet pour lancer en local
- `COMMANDES_POSTGRESQL.md` - Commandes PostgreSQL essentielles
- `COMMANDES_RAPIDES.md` - Référence rapide des commandes

### 📖 Documentation Technique
- `QUICK_START.md` - Guide de démarrage rapide
- `DOCUMENTATION.md` - Documentation technique complète
- `PROJET_COMPLET.md` - Récapitulatif détaillé du projet
- `CHECKLIST.md` - Checklist de déploiement
- `AMELIORATIONS.md` - Détails des améliorations apportées
- `CORRECTIONS_FINALES.md` - Détails des corrections apportées

