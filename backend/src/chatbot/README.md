# 🤖 Chatbot IA avec RAG (Retrieval Augmented Generation)

## 📋 Vue d'ensemble

Ce module implémente un chatbot IA professionnel utilisant la technique RAG pour répondre aux utilisateurs uniquement à partir des données internes stockées dans Supabase.

## 🔧 Configuration

### Variables d'environnement requises

Ajoutez dans votre fichier `.env` du backend :

```env
# OpenAI API Key (requis pour les embeddings et la génération de texte)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase (déjà configuré)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Installation des dépendances

Le module utilise déjà les dépendances suivantes (déjà installées) :
- `@supabase/supabase-js` - Pour accéder à Supabase
- `axios` - Pour les appels API OpenAI

## 🏗️ Architecture

### Structure du module

```
chatbot/
├── chatbot.module.ts      # Module NestJS
├── chatbot.controller.ts  # Contrôleur REST
├── chatbot.service.ts     # Service RAG principal
└── dto/
    └── chat-message.dto.ts  # DTOs pour les requêtes/réponses
```

### Flux de fonctionnement

1. **Réception de la requête** : L'utilisateur envoie un message via l'API
2. **Génération d'embedding** : Le message est converti en vecteur via OpenAI
3. **Recherche de documents** : Recherche dans Supabase (FAQs, articles, ressources, services)
4. **Construction du contexte** : Les documents pertinents sont assemblés
5. **Génération de réponse** : OpenAI génère une réponse basée sur le contexte
6. **Retour de la réponse** : La réponse avec les sources est renvoyée

## 📊 Tables Supabase utilisées

Le chatbot recherche dans les tables suivantes :
- `faqs` - Questions fréquentes
- `articles` - Articles de blog
- `ressources` - Ressources documentaires
- `services` - Services proposés

**Note** : Adaptez les noms de colonnes dans `chatbot.service.ts` selon votre schéma Supabase.

## 🚀 Utilisation

### Endpoint API

```
POST /chatbot/chat
```

**Body :**
```json
{
  "message": "Quels sont vos services en cybersécurité ?",
  "conversationId": "conv-123" // Optionnel
}
```

**Response :**
```json
{
  "response": "Nous proposons plusieurs services en cybersécurité...",
  "conversationId": "conv-123",
  "sources": [
    {
      "type": "service",
      "title": "Cybersécurité",
      "content": "Service: Cybersécurité\nDescription: ...",
      "relevance": 0.8
    }
  ],
  "tokensUsed": {
    "prompt": 500,
    "completion": 200,
    "total": 700
  }
}
```

## 🔄 Améliorations futures

### Recherche vectorielle native

Pour une meilleure performance, implémentez une vraie recherche vectorielle :

1. **Stocker les embeddings** : Créez une table `document_embeddings` dans Supabase
2. **Utiliser pgvector** : Activez l'extension pgvector dans Supabase
3. **Recherche par similarité cosinus** : Utilisez `<=>` pour la recherche vectorielle

Exemple de migration SQL :

```sql
-- Activer pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Créer la table d'embeddings
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding vector(1536), -- Dimension pour text-embedding-3-small
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Créer un index pour la recherche vectorielle
CREATE INDEX ON document_embeddings USING ivfflat (embedding vector_cosine_ops);
```

### Indexation automatique

Créez un service d'indexation qui :
- Parcourt automatiquement les tables Supabase
- Génère les embeddings pour chaque document
- Les stocke dans `document_embeddings`

## 🛡️ Sécurité

- L'endpoint est public (`@Public()`) mais peut être protégé si nécessaire
- Les clés API OpenAI doivent être gardées secrètes
- Limitez le taux de requêtes avec Throttler (déjà configuré)

## 📝 Notes

- Le modèle utilisé est `gpt-4-turbo-preview` (modifiable dans `chatbot.service.ts`)
- Le modèle d'embedding est `text-embedding-3-small`
- La température est fixée à 0.7 pour un bon équilibre créativité/précision
- Les réponses sont limitées à 500 tokens maximum





