'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import api from '@/lib/api'
import { useChatbot } from '@/context/ChatbotContext'
import { useFloatingButtons } from '@/context/FloatingButtonsContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    type: string
    title: string
    content: string
    relevance: number
  }>
}

export function Chatbot() {
  const { isOpen, setIsOpen } = useChatbot()
  const { areButtonsVisible } = useFloatingButtons()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis l\'assistant IA de Sil Talents Tech. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await api.post('/chatbot/chat', {
        message: userMessage.content,
        conversationId: conversationId,
      })

      // Logs détaillés pour déboguer
      console.log('=== DÉBUT DEBUG CHATBOT ===')
      console.log('Réponse complète du serveur:', response)
      console.log('Type de response:', typeof response)
      console.log('response.data existe?', !!response?.data)
      console.log('response.data:', response?.data)
      console.log('response.data.response existe?', !!response?.data?.response)
      console.log('response.data.response:', response?.data?.response)
      console.log('Type de response.data.response:', typeof response?.data?.response)
      console.log('Longueur de response.data.response:', response?.data?.response?.length)

      // Vérifier que la réponse existe et n'est pas vide
      let responseContent = '';
      
      // Vérifier d'abord la structure complète de la réponse
      if (!response) {
        console.error('❌ response est undefined!')
        throw new Error('Réponse du serveur invalide')
      }
      
      if (!response.data) {
        console.error('❌ response.data est undefined!')
        console.error('response complet:', response)
        throw new Error('Données de réponse invalides')
      }
      
      // La structure est: { success: true, data: { response: "...", conversationId: "...", sources: [...] }, timestamp: "..." }
      // Donc la réponse est dans response.data.data.response
      
      // Vérifier la structure de response.data
      console.log('Structure de response.data:', {
        keys: Object.keys(response.data),
        hasData: !!response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : [],
      })
      
      // Accéder à response.data.data.response (structure avec wrapper)
      if (response.data.data && typeof response.data.data === 'object') {
        if (response.data.data.response && typeof response.data.data.response === 'string') {
          responseContent = response.data.data.response
          console.log('✅ response.data.data.response trouvé, longueur:', responseContent.length)
        } else if (response.data.data.message && typeof response.data.data.message === 'string') {
          responseContent = response.data.data.message
          console.log('✅ response.data.data.message trouvé, longueur:', responseContent.length)
        } else if (response.data.data.content && typeof response.data.data.content === 'string') {
          responseContent = response.data.data.content
          console.log('✅ response.data.data.content trouvé, longueur:', responseContent.length)
        }
      }
      
      // Fallback: Si response.data est directement une string
      if (!responseContent && typeof response.data === 'string') {
        responseContent = response.data
        console.log('✅ response.data est directement une string, longueur:', responseContent.length)
      } 
      // Fallback: Si response.data.response existe (structure sans wrapper)
      else if (!responseContent && response.data.response && typeof response.data.response === 'string') {
        responseContent = response.data.response
        console.log('✅ response.data.response trouvé (sans wrapper), longueur:', responseContent.length)
      }
      // Fallback: Si response.data.message existe
      else if (!responseContent && response.data.message && typeof response.data.message === 'string') {
        responseContent = response.data.message
        console.log('✅ response.data.message trouvé, longueur:', responseContent.length)
      }
      
      // Si toujours rien trouvé
      if (!responseContent) {
        console.warn('⚠️ Aucune réponse trouvée dans la structure')
        console.warn('response.data complet:', JSON.stringify(response.data, null, 2))
        responseContent = 'Je n\'ai pas pu générer de réponse pour votre question. Sil Talents Tech est un cabinet de recrutement spécialisé en technologies. Pour plus d\'informations, contactez-nous à contact@sil-talents-tech.com.'
      }

      // Vérification finale
      if (!responseContent || typeof responseContent !== 'string' || responseContent.trim().length === 0) {
        console.error('❌ responseContent est toujours vide ou invalide après toutes les tentatives')
        responseContent = 'Je n\'ai pas pu générer de réponse pour votre question. Sil Talents Tech est un cabinet de recrutement spécialisé en technologies. Pour plus d\'informations, contactez-nous à contact@sil-talents-tech.com.'
      } else {
        console.log('✅ Réponse valide finale, longueur:', responseContent.length)
        console.log('Aperçu de la réponse:', responseContent.substring(0, 300))
      }
      console.log('=== FIN DEBUG CHATBOT ===')

      // Extraire les sources et conversationId de la bonne structure
      const sources = response.data?.data?.sources || response.data?.sources || []
      const conversationIdFromResponse = response.data?.data?.conversationId || response.data?.conversationId || null

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent.trim(),
        timestamp: new Date(),
        sources: sources,
      }

      setConversationId(conversationIdFromResponse)
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Erreur chatbot complète:', error)
      console.error('error.response:', error.response)
      console.error('error.response?.data:', error.response?.data)
      
      // Message d'erreur plus détaillé
      let errorContent = 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.'
      
      if (error.response?.status === 429) {
        errorContent = 'Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.'
      } else if (error.response?.data?.response) {
        // Si le backend retourne une réponse dans error.response.data.response
        errorContent = error.response.data.response
      } else if (error.response?.data?.message) {
        errorContent = error.response.data.message
      } else if (error.message) {
        // Si c'est "La réponse du serveur est vide", utiliser une réponse par défaut
        if (error.message.includes('vide')) {
          errorContent = 'Sil Talents Tech est un cabinet de recrutement spécialisé en technologies (IT, cybersécurité, IA, réseaux, transformation digitale). Nous accompagnons les entreprises dans leur croissance technologique. Pour plus d\'informations, contactez-nous à contact@sil-talents-tech.com.'
        } else {
          errorContent = `Erreur: ${error.message}`
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <AnimatePresence>
        {areButtonsVisible && (
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-6 right-[88px] md:right-[88px] z-[9998] bg-[#297BFF] text-white shadow-2xl flex items-center justify-center group w-14 h-14 md:w-16 md:h-16 rounded-none"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            whileHover={{ 
              scale: 1.15,
              boxShadow: '0 0 30px rgba(41, 123, 255, 0.6)',
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(41, 123, 255, 0.3)',
            }}
          >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="z-10 relative"
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="z-10 relative"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Effet de glow au hover */}
        <motion.div
          className="absolute inset-0 bg-[#297BFF] opacity-0 group-hover:opacity-50"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        </motion.button>
        )}
      </AnimatePresence>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-[25vh] left-0 right-0 bottom-[25vh] md:top-auto md:left-auto md:right-6 md:bottom-32 md:w-[420px] md:h-[70vh] z-[9999] bg-gradient-to-b from-[#1A1A1A] via-[#1F1F1F] to-[#1A1A1A] border-0 md:border md:border-[#297BFF]/50  shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(41, 123, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
            {/* Header amélioré */}
            <div className="bg-gradient-to-r from-[#297BFF] via-[#1f63d6] to-[#297BFF] p-4 md:p-5 flex items-center justify-between border-b border-[#297BFF]/30 flex-shrink-0 relative overflow-hidden">
              {/* Effet de brillance animé */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <div className="flex items-center gap-2 md:gap-3 relative z-10">
                <div className="relative">
                  <Bot className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-[#1A1A1A] shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold drop-shadow-lg" style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 500 }}>
                    Assistant IA
                  </h3>
                  <p className="text-white/90 text-xs drop-shadow" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                    Sil Talents Tech
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/90 hover:text-white hover:bg-white/10 transition-all p-2 rounded-lg flex-shrink-0 relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 md:space-y-5 bg-gradient-to-b from-[#1A1A1A] to-[#151515] min-h-0 scrollbar-thin scrollbar-thumb-[#297BFF]/30 scrollbar-track-transparent">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-none bg-[#297BFF]/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 md:w-5 md:h-5 text-[#297BFF]" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-xl p-3 md:p-4 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-[#297BFF] to-[#1f63d6] text-white shadow-[#297BFF]/30'
                        : 'bg-gradient-to-br from-[#2A2A2A] to-[#252525] text-[#E0E0E0] border border-[#297BFF]/20 shadow-black/20'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontSize: '14px',
                      lineHeight: '1.6',
                    }}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs opacity-70 mb-1">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.slice(0, 2).map((source, idx) => (
                            <div key={idx} className="text-xs opacity-60">
                              • {source.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-none bg-[#297BFF]/20 flex items-center justify-center">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-[#297BFF]" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 md:gap-3 justify-start"
                >
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-none bg-[#297BFF]/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-[#297BFF]" />
                  </div>
                  <div className="bg-[#2A2A2A] border border-[#297BFF]/30 rounded-none p-2.5 md:p-3">
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-[#297BFF] animate-spin" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input amélioré */}
            <div className="p-4 md:p-5 border-t border-[#297BFF]/20 bg-gradient-to-t from-[#1A1A1A] to-[#1F1F1F] flex-shrink-0 backdrop-blur-sm">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={isLoading}
                  className="flex-1 bg-[#2A2A2A]/80 backdrop-blur-sm border border-[#297BFF]/20 text-white px-4 md:px-5 py-3 rounded-xl focus:outline-none focus:border-[#297BFF] focus:ring-2 focus:ring-[#297BFF]/30 transition-all disabled:opacity-50 placeholder:text-[#7B7B7B]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 300,
                    fontSize: '14px',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-br from-[#297BFF] to-[#1f63d6] text-white p-3 rounded-xl hover:from-[#1f63d6] hover:to-[#297BFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#297BFF]/30 hover:shadow-[#297BFF]/50 hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#7B7B7B] mt-3 text-center" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                Réponses basées sur les données internes de Sil Talents Tech
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

