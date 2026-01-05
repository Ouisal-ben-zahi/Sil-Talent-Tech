import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import axios, { AxiosError } from 'axios';
import { ChatMessageDto, ChatResponseDto } from './dto/chat-message.dto';

interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    type: string;
    source: string;
    title?: string;
  };
  embedding?: number[];
}

@Injectable()
export class ChatbotService implements OnModuleInit {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly openaiApiKey: string;
  private readonly openaiApiUrl = 'https://api.openai.com/v1';
  private readonly embeddingModel = 'text-embedding-3-small';
  private readonly chatModel: string;
  private readonly embeddingCache = new Map<string, { embedding: number[]; timestamp: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    const rawApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    
    // Vérifier si c'est un placeholder
    const placeholderPatterns = [
      'sk-votre',
      'sk-your',
      'your-api-key',
      'votre-cle-api',
      'placeholder',
      'example',
      'sk-example',
    ];
    
    const isPlaceholder = placeholderPatterns.some(pattern => 
      rawApiKey.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isPlaceholder && rawApiKey.length > 0) {
      this.logger.warn('⚠️ Placeholder détecté dans OPENAI_API_KEY. Le chatbot fonctionnera en mode fallback uniquement.');
      this.logger.warn('Pour activer OpenAI, remplacez le placeholder par une vraie clé API dans backend/.env');
      this.openaiApiKey = ''; // Traiter comme vide
    } else {
      this.openaiApiKey = rawApiKey;
    }
    
    // Modèle de chat : utilisez 'gpt-4-turbo' si disponible, sinon 'gpt-3.5-turbo' (plus accessible)
    // Le modèle gpt-4-turbo-preview n'existe plus, utilisez 'gpt-4-turbo' ou 'gpt-3.5-turbo'
    this.chatModel = this.configService.get<string>('OPENAI_CHAT_MODEL') || 'gpt-3.5-turbo';
  }

  async onModuleInit() {
    if (!this.openaiApiKey) {
      this.logger.warn('⚠️ OPENAI_API_KEY n\'est pas configuré. Le chatbot fonctionnera en mode fallback uniquement.');
      this.logger.warn('Pour activer OpenAI, ajoutez OPENAI_API_KEY dans votre fichier .env du backend');
    } else {
      const keyPreview = this.openaiApiKey.substring(0, 7) + '...' + this.openaiApiKey.substring(this.openaiApiKey.length - 4);
      this.logger.log(`✅ Chatbot RAG initialisé avec succès (OpenAI API Key: ${keyPreview})`);
      this.logger.log(`✅ Modèle de chat utilisé: ${this.chatModel}`);
    }
  }

  /**
   * Génère un embedding pour un texte donné avec cache et retry
   */
  private async generateEmbedding(text: string, retries: number = 2): Promise<number[]> {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY n\'est pas configuré');
    }

    // Vérifier le cache
    const cacheKey = text.toLowerCase().trim();
    const cached = this.embeddingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug('Embedding récupéré depuis le cache');
      return cached.embedding;
    }

    // Retry logic avec backoff exponentiel
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await axios.post(
          `${this.openaiApiUrl}/embeddings`,
          {
            model: this.embeddingModel,
            input: text,
          },
          {
            headers: {
              Authorization: `Bearer ${this.openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 secondes timeout
          },
        );

        const embedding = response.data.data[0].embedding;
        
        // Mettre en cache
        this.embeddingCache.set(cacheKey, {
          embedding,
          timestamp: Date.now(),
        });

        return embedding;
      } catch (error) {
        const axiosError = error as AxiosError;
        
        // Gérer l'erreur 429 (Too Many Requests)
        if (axiosError.response?.status === 429) {
          // Pour les rate limits, utiliser le fallback immédiatement plutôt que d'attendre
          // car les rate limits peuvent durer plusieurs minutes
          this.logger.warn(
            `⚠️ Rate limit OpenAI atteint (429) pour embedding. Tentative ${attempt + 1}/${retries}. Utilisation du fallback textuel immédiatement.`
          );
          
          // Si c'est la première tentative, on peut essayer une fois de plus après un court délai
          if (attempt === 0 && retries > 1) {
            const shortWait = 5000; // Attendre seulement 5 secondes
            this.logger.warn(`Attente ${shortWait/1000}s avant une dernière tentative...`);
            await new Promise(resolve => setTimeout(resolve, shortWait));
            continue;
          } else {
            // Sinon, utiliser le fallback immédiatement
            throw new Error('RATE_LIMIT_FALLBACK');
          }
        }
        
        // Gérer l'erreur 401 (Unauthorized - Clé API invalide)
        if (axiosError.response?.status === 401) {
          const errorData = axiosError.response?.data as any;
          const errorMessage = errorData?.error?.message || 'Clé API OpenAI invalide';
          this.logger.error(`Erreur 401 - Clé API OpenAI invalide pour embedding: ${errorMessage}`);
          this.logger.error('Vérifiez que votre clé API dans le fichier .env est correcte et commence par "sk-"');
          throw new Error('INVALID_API_KEY_FALLBACK');
        }
        
        // Gérer les erreurs serveur (500, 503)
        if (axiosError.response?.status === 500 || axiosError.response?.status === 503) {
          if (attempt < retries - 1) {
            const waitTime = 1000 * Math.pow(2, attempt);
            this.logger.warn(`Erreur serveur OpenAI. Retry dans ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        this.logger.error('Erreur lors de la génération de l\'embedding:', {
          status: axiosError.response?.status,
          message: axiosError.message,
          attempt: attempt + 1,
        });
        
        if (attempt === retries - 1) {
          throw new Error('Impossible de générer l\'embedding après plusieurs tentatives');
        }
      }
    }

    // Si on arrive ici, toutes les tentatives ont échoué
    throw new Error('Impossible de générer l\'embedding');
  }

  /**
   * Récupère les documents pertinents depuis les pages statiques Next.js
   */
  private async retrieveRelevantDocuments(
    queryEmbedding: number[],
    limit: number = 5,
    queryText?: string,
  ): Promise<DocumentChunk[]> {
    try {
      // Récupérer le contenu statique depuis l'API Next.js
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      let staticContent: any = null;

      try {
        const response = await axios.get(`${frontendUrl}/api/static-content`);
        staticContent = response.data;
      } catch (error) {
        this.logger.warn('Impossible de récupérer le contenu statique depuis le frontend, utilisation de données par défaut');
        // Fallback: utiliser des données vides si l'API n'est pas disponible
        staticContent = { faqs: [], services: [], ressources: [] };
      }

      // Transformer les données statiques en DocumentChunk
      const documents: DocumentChunk[] = [];

      // Traiter les FAQs
      if (staticContent.faqs && Array.isArray(staticContent.faqs)) {
        staticContent.faqs.forEach((category: any, catIndex: number) => {
          if (category.questions && Array.isArray(category.questions)) {
            category.questions.forEach((faq: any, faqIndex: number) => {
              documents.push({
                id: `faq-${catIndex}-${faqIndex}`,
                content: `Question: ${faq.question}\nRéponse: ${faq.answer}`,
                metadata: {
                  type: 'faq',
                  source: 'faqs',
                  title: faq.question,
                },
              });
            });
          }
        });
      }

      // Traiter les Services
      if (staticContent.services && Array.isArray(staticContent.services)) {
        staticContent.services.forEach((service: any, index: number) => {
          const contentParts = [
            `Service: ${service.nom}`,
            `Description: ${service.description || ''}`,
            service.heroTitle ? `Titre: ${service.heroTitle}` : '',
            service.heroDescription ? `Présentation: ${service.heroDescription}` : '',
            service.presentationTitle ? `Titre présentation: ${service.presentationTitle}` : '',
            service.presentationBody ? `Détails: ${service.presentationBody}` : '',
          ];
          
          // Ajouter les problèmes si disponibles
          if (service.problems && Array.isArray(service.problems)) {
            contentParts.push(`Problèmes résolus: ${service.problems.join(' ')}`);
          }
          
          // Ajouter les secteurs si disponibles
          if (service.sectors && Array.isArray(service.sectors)) {
            contentParts.push(`Secteurs: ${service.sectors.join(', ')}`);
          }
          
          // Ajouter les livrables si disponibles
          if (service.deliverables && Array.isArray(service.deliverables)) {
            contentParts.push(`Livrables: ${service.deliverables.join(', ')}`);
          }
          
          // Ajouter les avantages si disponibles
          if (service.advantages && Array.isArray(service.advantages)) {
            contentParts.push(`Avantages: ${service.advantages.join(' ')}`);
          }
          
          const content = contentParts.filter(Boolean).join('\n');

          documents.push({
            id: `service-${index}`,
            content,
            metadata: {
              type: 'service',
              source: 'services',
              title: service.nom,
            },
          });
        });
      }

      // Traiter les Pages statiques (accueil, à propos, etc.)
      if (staticContent.pages) {
        // Page d'accueil
        if (staticContent.pages.accueil) {
          const accueil = staticContent.pages.accueil;
          let accueilContent = `Page: ${accueil.title}\n`;
          
          if (accueil.sections && Array.isArray(accueil.sections)) {
            accueil.sections.forEach((section: any) => {
              if (section.type === 'hero') {
                accueilContent += `Hero: ${section.title}\n${section.description}\n`;
                if (section.services && Array.isArray(section.services)) {
                  accueilContent += `Services: ${section.services.join(', ')}\n`;
                }
              } else if (section.type === 'servicesPreview') {
                accueilContent += `Services Preview: ${section.title}\n${section.description}\n`;
                if (section.services && Array.isArray(section.services)) {
                  section.services.forEach((service: any) => {
                    accueilContent += `- ${service.title}: ${service.description}\n`;
                  });
                }
              } else if (section.type === 'whySil') {
                accueilContent += `Pourquoi Sil: ${section.title}\n${section.subtitle}\n${section.description}\n`;
                if (section.points && Array.isArray(section.points)) {
                  section.points.forEach((point: any) => {
                    accueilContent += `- ${point.title} ${point.subtitle}: ${point.description}\n`;
                  });
                }
              }
            });
          }
          
          documents.push({
            id: 'page-accueil',
            content: accueilContent,
            metadata: {
              type: 'page',
              source: 'pages',
              title: accueil.title,
            },
          });
        }
        
        // Page à propos
        if (staticContent.pages.aPropos) {
          const aPropos = staticContent.pages.aPropos;
          let aProposContent = `Page: ${aPropos.title}\n${aPropos.description}\n`;
          
          if (aPropos.valeurs && Array.isArray(aPropos.valeurs)) {
            aProposContent += `Valeurs:\n`;
            aPropos.valeurs.forEach((valeur: any) => {
              aProposContent += `- ${valeur.title}: ${valeur.description}\n`;
            });
          }
          
          if (aPropos.forces && Array.isArray(aPropos.forces)) {
            aProposContent += `Forces:\n`;
            aPropos.forces.forEach((force: any) => {
              aProposContent += `- ${force.title}: ${force.description}\n`;
            });
          }
          
          documents.push({
            id: 'page-a-propos',
            content: aProposContent,
            metadata: {
              type: 'page',
              source: 'pages',
              title: aPropos.title,
            },
          });
        }
      }

      // Traiter les Ressources
      if (staticContent.ressources && Array.isArray(staticContent.ressources)) {
        staticContent.ressources.forEach((ressource: any, index: number) => {
          documents.push({
            id: `ressource-${index}`,
            content: `Titre: ${ressource.titre || ressource.title}\nContenu: ${ressource.contenu || ressource.content || ressource.description || ''}`,
            metadata: {
              type: 'ressource',
              source: 'ressources',
              title: ressource.titre || ressource.title,
            },
          });
        });
      }

      // Si la requête concerne les services et qu'on n'a pas de documents de services, les inclure quand même
      const queryLower = queryText?.toLowerCase() || '';
      const isServiceQuery = queryLower.includes('service') || 
                             queryLower.includes('services') ||
                             queryLower.includes('propos') || 
                             queryLower.includes('propose') ||
                             queryLower.includes('offre') ||
                             queryLower.includes('offres') ||
                             queryLower.includes('quoi') ||
                             queryLower.includes('quels') ||
                             queryLower.includes('quelles') ||
                             queryLower.trim() === 'service proposé' ||
                             queryLower.trim() === 'services proposés';
      
      // Si c'est une question sur les services, s'assurer qu'on récupère tous les services
      if (isServiceQuery) {
        const serviceDocs = documents.filter(doc => doc.metadata.type === 'service');
        if (serviceDocs.length === 0) {
          // Récupérer tous les services même s'ils n'ont pas été trouvés par la recherche
          if (staticContent.services && Array.isArray(staticContent.services)) {
            staticContent.services.forEach((service: any, index: number) => {
              const content = [
                `Service: ${service.nom}`,
                `Description: ${service.description || ''}`,
                service.heroDescription ? `Présentation: ${service.heroDescription}` : '',
                service.presentationBody ? `Détails: ${service.presentationBody}` : '',
              ].filter(Boolean).join('\n');

              documents.push({
                id: `service-${index}`,
                content,
                metadata: {
                  type: 'service',
                  source: 'services',
                  title: service.nom,
                },
              });
            });
          }
        }
      }

      // Calculer la similarité pour chaque document
      const documentsWithSimilarity = documents.map((doc) => {
        // Utiliser la recherche textuelle si on a le texte de requête
        let similarity = 0;
        if (queryText) {
          similarity = this.calculateTextSimilaritySimple(queryText, doc.content);
          // Bonus pour les services si la requête concerne les services
          if (isServiceQuery && doc.metadata.type === 'service') {
            similarity = Math.max(similarity, 0.8);
          }
        } else {
          similarity = this.calculateTextSimilarity(queryEmbedding, doc.content, queryText);
        }
        return { ...doc, similarity };
      });

      // Trier par similarité et retourner les plus pertinents
      const sortedDocs = documentsWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(({ similarity, ...doc }) => doc);
      
      // Si c'est une question sur les services et qu'on n'a pas de services dans les résultats, les ajouter
      if (isServiceQuery && sortedDocs.filter(d => d.metadata.type === 'service').length === 0) {
        const allServices = documents.filter(d => d.metadata.type === 'service');
        if (allServices.length > 0) {
          // Remplacer les moins pertinents par les services
          return [...allServices.slice(0, limit), ...sortedDocs.filter(d => d.metadata.type !== 'service')].slice(0, limit);
        }
      }
      
      return sortedDocs;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des documents:', error);
      return [];
    }
  }

  /**
   * Calcule une similarité textuelle simple basée sur les mots-clés
   */
  private calculateTextSimilaritySimple(query: string, text: string): number {
    const queryLower = query.toLowerCase().trim();
    const textLower = text.toLowerCase();
    
    // Normaliser les variations de "sil talent tech"
    const normalizedQuery = queryLower
      .replace(/sil\s*talent(s)?\s*tech/gi, 'sil talents tech')
      .replace(/sil\s*talents?\s*tech/gi, 'sil talents tech');
    
    // Mots-clés importants pour les services
    const serviceKeywords = ['service', 'services', 'propos', 'offre', 'offres', 'expertise', 'domaine', 'quoi', 'quels', 'quelles'];
    const hasServiceKeyword = serviceKeywords.some(kw => queryLower.includes(kw));
    
    // Mots-clés pour la localisation/agence
    const locationKeywords = ['agence', 'adresse', 'localisation', 'localiser', 'trouve', 'trouver', 'où', 'ou', 'siège', 'bureau'];
    const hasLocationKeyword = locationKeywords.some(kw => queryLower.includes(kw));
    
    // Mots-clés pour les questions générales sur l'entreprise
    const companyKeywords = ['sil', 'talents', 'tech', 'entreprise', 'cabinet', 'qui', 'qu\'est', 'c\'est', 'quoi'];
    const hasCompanyKeyword = companyKeywords.some(kw => queryLower.includes(kw));
    
    // Si la requête contient des mots-clés de service, augmenter le score pour les documents de type service
    if (hasServiceKeyword && textLower.includes('service')) {
      return 0.9; // Score élevé pour les services
    }
    
    // Si la requête concerne la localisation, augmenter le score pour les documents contenant des informations de contact/localisation
    if (hasLocationKeyword && (textLower.includes('marrakech') || textLower.includes('maroc') || textLower.includes('adresse') || textLower.includes('contact') || textLower.includes('localisation'))) {
      return 0.95; // Score très élevé pour la localisation
    }
    
    // Si la requête concerne l'entreprise (sil talents tech), augmenter le score pour les FAQs générales
    if (hasCompanyKeyword && (textLower.includes('sil') || textLower.includes('talents') || textLower.includes('tech') || textLower.includes('cabinet') || textLower.includes('recrutement'))) {
      return 0.9; // Score élevé pour les informations sur l'entreprise
    }
    
    // Recherche par mots-clés
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    let matches = 0;
    let totalWeight = 0;
    
    queryWords.forEach(word => {
      let weight = word.length > 4 ? 2 : 1; // Poids plus élevé pour les mots longs
      // Poids supplémentaire pour les mots-clés importants
      if (serviceKeywords.includes(word) || locationKeywords.includes(word) || companyKeywords.includes(word)) {
        weight = 3;
      }
      totalWeight += weight;
      if (textLower.includes(word)) {
        matches += weight;
      }
    });
    
    // Bonus si le titre contient des mots de la requête
    const titleMatch = queryWords.some(word => textLower.split('\n')[0]?.toLowerCase().includes(word));
    if (titleMatch) {
      matches += 2;
      totalWeight += 2;
    }
    
    return totalWeight > 0 ? Math.min(matches / totalWeight, 1) : 0;
  }

  /**
   * Calcule une similarité textuelle (placeholder pour recherche vectorielle)
   */
  private calculateTextSimilarity(
    queryEmbedding: number[],
    text: string,
    queryText?: string,
  ): number {
    // Si on a un texte de requête, utiliser la recherche textuelle simple
    if (queryText) {
      return this.calculateTextSimilaritySimple(queryText, text);
    }
    // Sinon, retourner une valeur par défaut
    return 0.5;
  }

  /**
   * Génère une réponse en utilisant RAG
   */
  async generateResponse(
    chatDto: ChatMessageDto,
  ): Promise<ChatResponseDto> {
    // Même sans OpenAI, on peut répondre avec le fallback
    const useOpenAI = !!this.openaiApiKey;
    
    this.logger.debug(`Génération de réponse pour: "${chatDto.message}" (OpenAI: ${useOpenAI ? 'activé' : 'désactivé'})`);

    try {
      // 1. Générer l'embedding de la requête (avec retry et cache) si OpenAI est disponible
      let queryEmbedding: number[] = [];
      if (useOpenAI) {
        try {
          queryEmbedding = await this.generateEmbedding(chatDto.message);
        } catch (error: any) {
          // Si l'embedding échoue (rate limit, etc.), utiliser une recherche textuelle
          const errorMessage = error.message || 'Erreur inconnue';
          if (errorMessage.includes('RATE_LIMIT_FALLBACK')) {
            this.logger.warn('⚠️ Rate limit OpenAI atteint pour l\'embedding. Utilisation de la recherche textuelle améliorée.');
          } else if (errorMessage.includes('INVALID_API_KEY_FALLBACK')) {
            this.logger.warn('⚠️ Clé API OpenAI invalide. Utilisation du fallback.');
          } else {
            this.logger.warn('⚠️ Impossible de générer l\'embedding, utilisation de la recherche textuelle:', errorMessage);
          }
          queryEmbedding = []; // Tableau vide pour déclencher la recherche textuelle
        }
      }

      // 2. Récupérer les documents pertinents
      const relevantDocs = await this.retrieveRelevantDocuments(
        queryEmbedding,
        5,
        chatDto.message, // Passer le texte de requête pour la recherche textuelle
      );

      // Vérifier qu'on a des documents
      if (relevantDocs.length === 0) {
        this.logger.warn('Aucun document trouvé pour la requête:', chatDto.message);
        
        // Pour les questions sur l'entreprise, retourner une réponse spécifique
        const queryLower = chatDto.message.toLowerCase();
        const isCompanyQuery = queryLower.includes('sil') || queryLower.includes('talents') || 
                               queryLower.includes('tech') || queryLower.includes('entreprise') ||
                               queryLower.includes('cabinet');
        
        if (isCompanyQuery) {
          return {
            response: 'Sil Talents Tech est un cabinet de recrutement spécialisé en technologies (IT, cybersécurité, IA, réseaux, transformation digitale). Nous accompagnons les entreprises dans leur croissance technologique en leur trouvant les meilleurs talents. Nous proposons des services de recrutement en cybersécurité, intelligence artificielle, réseaux & télécom, et conseil & expertise IT. Pour plus d\'informations, visitez notre site ou contactez-nous à contact@sil-talents-tech.com.',
            conversationId: chatDto.conversationId || this.generateConversationId(),
            sources: [],
          };
        }
        
        // Retourner une réponse même sans documents
        return {
          response: 'Je n\'ai pas trouvé d\'informations spécifiques dans notre base de données pour répondre à votre question. Pourriez-vous reformuler votre question ou nous contacter directement à contact@sil-talents-tech.com pour plus d\'informations ?',
          conversationId: chatDto.conversationId || this.generateConversationId(),
          sources: [],
        };
      }

      // 3. Construire le contexte pour le LLM
      const context = relevantDocs
        .map(
          (doc) =>
            `[${doc.metadata.type.toUpperCase()}] ${doc.metadata.title || 'Document'}\n${doc.content}`,
        )
        .join('\n\n---\n\n');
      
      this.logger.debug(`Contexte construit avec ${relevantDocs.length} documents`);

      // 4. Construire le prompt système
      const systemPrompt = `Tu es un assistant IA professionnel pour Sil Talents Tech, un cabinet de recrutement spécialisé en technologies (IT, cybersécurité, IA, réseaux, transformation digitale).

Règles CRITIQUES:
- Réponds UNIQUEMENT à partir des informations fournies dans le contexte
- Si tu ne trouves pas d'information pertinente dans le contexte, dis clairement "Je ne connais pas la réponse à cette question" en 1 phrase
- Réponds TOUJOURS en 2-3 phrases maximum (très court et direct)
- Sois simple, clair et précis - évite les phrases longues et complexes
- Utilise un ton professionnel mais accessible
- Réponds en français sauf si on te demande explicitement en anglais
- Ne mentionne pas que tu es une IA, présente-toi comme un assistant de Sil Talents Tech
- Si la question n'est pas dans le contexte, dis simplement que tu ne connais pas la réponse

Contexte disponible:
${context}`;

      // 5. Appeler l'API OpenAI pour générer la réponse (avec retry)
      if (!useOpenAI) {
        this.logger.warn('OpenAI non disponible (clé API manquante), utilisation du fallback immédiatement');
        throw new Error('NO_OPENAI_FALLBACK');
      }

      let response: any;
      const maxRetries = 3;
      
      this.logger.debug(`Tentative d'appel OpenAI avec le modèle: ${this.chatModel}`);
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          response = await axios.post(
            `${this.openaiApiUrl}/chat/completions`,
            {
              model: this.chatModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: chatDto.message },
              ],
              temperature: 0.5,
              max_tokens: 150,
            },
            {
              headers: {
                Authorization: `Bearer ${this.openaiApiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 60000, // 60 secondes timeout
            },
          );
          this.logger.debug('Réponse OpenAI reçue avec succès');
          break; // Succès, sortir de la boucle
        } catch (error) {
          const axiosError = error as AxiosError;
          
          // Gérer l'erreur 401 (Unauthorized - Clé API invalide)
          if (axiosError.response?.status === 401) {
            const errorData = axiosError.response?.data as any;
            const errorMessage = errorData?.error?.message || 'Clé API OpenAI invalide';
            this.logger.error(`Erreur 401 - Clé API OpenAI invalide: ${errorMessage}`);
            this.logger.error('Vérifiez que votre clé API dans le fichier .env est correcte et commence par "sk-"');
            // Ne pas retry pour les erreurs 401, utiliser le fallback immédiatement
            throw new Error('INVALID_API_KEY_FALLBACK');
          }
          
          // Gérer l'erreur 429 (Too Many Requests)
          if (axiosError.response?.status === 429) {
            // Pour les rate limits, utiliser le fallback immédiatement plutôt que d'attendre
            this.logger.warn(
              `⚠️ Rate limit OpenAI atteint (429) pour chat. Tentative ${attempt + 1}/${maxRetries}. Utilisation du fallback immédiatement.`
            );
            
            // Si c'est la première tentative, on peut essayer une fois de plus après un court délai
            if (attempt === 0 && maxRetries > 1) {
              const shortWait = 5000; // Attendre seulement 5 secondes
              this.logger.warn(`Attente ${shortWait/1000}s avant une dernière tentative...`);
              await new Promise(resolve => setTimeout(resolve, shortWait));
              continue;
            } else {
              // Sinon, utiliser le fallback immédiatement
              this.logger.warn('Rate limit OpenAI atteint, utilisation du fallback intelligent');
              throw new Error('RATE_LIMIT_FALLBACK');
            }
          }
          
          // Gérer les erreurs serveur (500, 503)
          if (axiosError.response?.status === 500 || axiosError.response?.status === 503) {
            if (attempt < maxRetries - 1) {
              const waitTime = 1000 * Math.pow(2, attempt);
              this.logger.warn(`Erreur serveur OpenAI. Retry dans ${waitTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            } else {
              throw new Error('SERVER_ERROR_FALLBACK');
            }
          }
          
          // Relancer les autres erreurs si c'est la dernière tentative
          if (attempt === maxRetries - 1) {
            throw error;
          }
          
          // Attendre avant de réessayer pour les autres erreurs
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }

      let aiResponse = response.data.choices[0].message.content;
      const usage = response.data.usage;

      // Vérifier que la réponse n'est pas vide
      if (!aiResponse || aiResponse.trim().length === 0) {
        this.logger.warn('Réponse OpenAI vide, utilisation du fallback');
        throw new Error('EMPTY_RESPONSE_FALLBACK');
      }

      // Limiter la réponse à 2-3 phrases maximum
      aiResponse = this.limitResponseToSentences(aiResponse, 3);

      // 6. Préparer les sources pour la réponse
      const sources = relevantDocs.map((doc) => ({
        type: doc.metadata.type,
        title: doc.metadata.title || 'Document',
        content: doc.content.substring(0, 200) + '...',
        relevance: 0.8, // À améliorer avec de vraies métriques
      }));

      // Double vérification avant de retourner
      if (!aiResponse || aiResponse.trim().length === 0) {
        this.logger.error('Réponse OpenAI vide après vérification, utilisation du fallback');
        throw new Error('EMPTY_RESPONSE_FALLBACK');
      }

      return {
        response: aiResponse,
        conversationId: chatDto.conversationId || this.generateConversationId(),
        sources,
        tokensUsed: {
          prompt: usage.prompt_tokens,
          completion: usage.completion_tokens,
          total: usage.total_tokens,
        },
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      const axiosError = error as AxiosError;
      
      // Utiliser le fallback si OpenAI échoue ou n'est pas disponible
      const shouldUseFallback = !useOpenAI || 
          errorMessage === 'RATE_LIMIT_FALLBACK' || 
          errorMessage === 'SERVER_ERROR_FALLBACK' ||
          errorMessage === 'NO_OPENAI_FALLBACK' ||
          errorMessage === 'EMPTY_RESPONSE_FALLBACK' ||
          errorMessage === 'INVALID_API_KEY_FALLBACK' ||
          errorMessage === 'Clé API OpenAI invalide' ||
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 429 ||
          axiosError.response?.status >= 500;
      
      if (shouldUseFallback) {
        if (errorMessage === 'RATE_LIMIT_FALLBACK') {
          this.logger.warn('⚠️ Rate limit OpenAI atteint. Utilisation du fallback intelligent basé sur les documents.');
        } else {
          this.logger.warn('OpenAI indisponible, utilisation du fallback basé sur les documents');
        }
        
        try {
          // Récupérer les documents même sans embedding
          let relevantDocs = await this.retrieveRelevantDocuments(
            [],
            10, // Récupérer plus de documents pour le fallback
            chatDto.message,
          );
          
          // Si aucune question sur l'entreprise et qu'on n'a pas de documents, récupérer tous les documents disponibles
          const queryLower = chatDto.message.toLowerCase().trim();
          const isCompanyQuery = queryLower.includes('sil') || queryLower.includes('talents') || 
                                queryLower.includes('tech') || queryLower.includes('entreprise') ||
                                queryLower.includes('cabinet') || queryLower === 'sil talent tech' || 
                                queryLower === 'sil talents tech';
          
          // Pour les questions sur l'entreprise, s'assurer d'inclure les documents de page
          if (isCompanyQuery) {
            // Récupérer tous les documents disponibles pour les questions sur l'entreprise
            const allDocs = await this.retrieveRelevantDocuments([], 30, 'sil talents tech cabinet recrutement entreprise');
            this.logger.debug(`Récupération de ${allDocs.length} documents pour question sur l'entreprise`);
            // Fusionner avec les documents déjà trouvés, en priorisant les documents de page
            const pageDocsFromAll = allDocs.filter(doc => doc.metadata.type === 'page');
            if (pageDocsFromAll.length > 0) {
              relevantDocs = [...pageDocsFromAll, ...relevantDocs.filter(doc => doc.metadata.type !== 'page'), ...allDocs.filter(doc => doc.metadata.type !== 'page')];
              this.logger.debug(`Fusion: ${pageDocsFromAll.length} pages + autres documents`);
            } else {
              relevantDocs = [...allDocs, ...relevantDocs];
            }
          }
          
          // Si aucun document trouvé, essayer une recherche plus large
          if (relevantDocs.length === 0) {
            this.logger.warn('Aucun document trouvé, tentative de récupération avec requête générique');
            relevantDocs = await this.retrieveRelevantDocuments([], 30, 'sil talents tech');
            this.logger.debug(`Récupération générique: ${relevantDocs.length} documents`);
          }
          
          this.logger.debug(`Total de ${relevantDocs.length} documents récupérés pour le fallback`);
          
          // Générer une réponse courte à partir des documents trouvés
          const fallbackResponse = this.generateShortFallbackResponse(relevantDocs, chatDto.message);
          
          this.logger.debug(`Retour de fallback avec réponse de ${fallbackResponse.trim().length} caractères`);
          return {
            response: this.limitResponseToSentences(fallbackResponse.trim(), 3),
            conversationId: chatDto.conversationId || this.generateConversationId(),
            sources: relevantDocs.map((doc) => ({
              type: doc.metadata.type,
              title: doc.metadata.title || 'Document',
              content: doc.content.substring(0, 200) + '...',
              relevance: 0.7,
            })),
          };
        } catch (fallbackError) {
          this.logger.error('Erreur lors du fallback:', fallbackError);
          // Même en cas d'erreur de fallback, retourner une réponse courte
          return {
            response: "Je ne connais pas la réponse à cette question. Contactez-nous à contact@sil-talents-tech.com pour plus d'informations.",
            conversationId: chatDto.conversationId || this.generateConversationId(),
            sources: [],
          };
        }
      } else {
        // Si le fallback n'a pas été utilisé et qu'on arrive ici, retourner une réponse par défaut courte
        return {
          response: "Je ne connais pas la réponse à cette question. Contactez-nous à contact@sil-talents-tech.com pour plus d'informations.",
          conversationId: chatDto.conversationId || this.generateConversationId(),
          sources: [],
        };
      }
      
      // Si le fallback n'a pas été utilisé et qu'on arrive ici, retourner une réponse par défaut
      const errorData = axiosError.response?.data as any;
      const finalErrorMessage = errorData?.error?.message || errorData?.message || errorMessage;
      
      this.logger.error('Erreur lors de la génération de la réponse:', {
        status: axiosError.response?.status,
        message: errorMessage,
        error: errorData,
        query: chatDto.message,
      });
      
      // Retourner une réponse courte au lieu de throw pour éviter les messages vides
      return {
        response: "Je ne connais pas la réponse à cette question. Contactez-nous à contact@sil-talents-tech.com pour plus d'informations.",
        conversationId: chatDto.conversationId || this.generateConversationId(),
        sources: [],
      };
    }
  }

  /**
   * Limite une réponse à un nombre maximum de phrases
   */
  private limitResponseToSentences(response: string, maxSentences: number = 3): string {
    if (!response || response.trim().length === 0) {
      return response;
    }

    // Séparer les phrases (point, point d'exclamation, point d'interrogation suivis d'un espace ou fin de chaîne)
    const sentences = response.match(/[^.!?]+[.!?]+[\s]*/g) || [response];
    
    // Si on a moins ou égal au maximum, retourner tel quel
    if (sentences.length <= maxSentences) {
      return response.trim();
    }

    // Prendre les premières phrases et les joindre
    const limitedSentences = sentences.slice(0, maxSentences);
    let result = limitedSentences.join(' ').trim();
    
    // S'assurer qu'on termine proprement (pas de virgule à la fin)
    if (result && !result.match(/[.!?]$/)) {
      result += '.';
    }

    return result;
  }

  /**
   * Génère une réponse courte à partir de documents (pour le fallback)
   */
  private generateShortFallbackResponse(docs: DocumentChunk[], query: string): string {
    const queryLower = query.toLowerCase().trim();
    
    // Si aucun document, dire qu'on ne connaît pas la réponse
    if (docs.length === 0) {
      return "Je ne connais pas la réponse à cette question. Contactez-nous à contact@sil-talents-tech.com pour plus d'informations.";
    }

    // Vérifier si c'est une question de localisation
    const isLocationQuery = queryLower.includes('adresse') || 
                           queryLower.includes('localisation') || 
                           queryLower.includes('où') || 
                           queryLower.includes('ou') ||
                           queryLower.includes('agence');
    
    if (isLocationQuery) {
      return "Notre adresse : Marrakech, Maroc. Contactez-nous à contact@sil-talents-tech.com pour plus d'informations.";
    }

    // Vérifier si c'est une question sur l'entreprise
    const isCompanyQuery = queryLower.includes('sil') || 
                          queryLower.includes('talents') || 
                          queryLower.includes('tech') || 
                          queryLower.includes('cabinet') ||
                          queryLower.includes('entreprise');
    
    if (isCompanyQuery) {
      return "Sil Talents Tech est un cabinet de recrutement spécialisé en technologies (IT, cybersécurité, IA, réseaux). Nous accompagnons les entreprises dans leur croissance technologique.";
    }

    // Vérifier si c'est une question sur les services
    const isServiceQuery = queryLower.includes('service') || 
                           queryLower.includes('propos') || 
                           queryLower.includes('offre');
    
    if (isServiceQuery) {
      const serviceDocs = docs.filter(d => d.metadata.type === 'service');
      if (serviceDocs.length > 0) {
        const serviceNames = serviceDocs.slice(0, 3).map(d => d.metadata.title).join(', ');
        return `Nous proposons plusieurs services : ${serviceNames}. Pour plus de détails, visitez notre page services.`;
      }
      return "Nous proposons des services de recrutement en cybersécurité, intelligence artificielle, réseaux & télécom, et conseil IT.";
    }

    // Pour les FAQs, extraire la réponse courte
    const faqDocs = docs.filter(d => d.metadata.type === 'faq');
    if (faqDocs.length > 0) {
      const bestFaq = faqDocs[0];
      const answerMatch = bestFaq.content.match(/Réponse:\s*(.+?)(?:\n|$)/i);
      if (answerMatch) {
        const answer = answerMatch[1].trim();
        return this.limitResponseToSentences(answer, 3);
      }
    }

    // Sinon, utiliser le meilleur document disponible
    const bestDoc = docs[0];
    if (bestDoc && bestDoc.content) {
      // Extraire les premières phrases du contenu
      const content = bestDoc.content.replace(/^(Question:|Réponse:|Service:|Description:)\s*/i, '').trim();
      const sentences = content.match(/[^.!?]+[.!?]+[\s]*/g) || [content];
      const shortContent = sentences.slice(0, 2).join(' ').trim();
      
      if (shortContent) {
        return this.limitResponseToSentences(shortContent, 2);
      }
    }

    // Dernière option : réponse générique courte
    return "Je ne connais pas la réponse précise à cette question. Contactez-nous à contact@sil-talents-tech.com pour plus d'informations.";
  }

  /**
   * Génère un ID de conversation unique
   */
  private generateConversationId(): string {
    return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
