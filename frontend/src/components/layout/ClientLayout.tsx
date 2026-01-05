'use client'

import { Header } from './Header'
import { Footer } from './Footer'
import { WhatsAppBanner } from '@/components/ui/WhatsAppBanner'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { CustomToaster } from '@/components/ui/CustomToaster'
import { Chatbot } from '@/components/ui/Chatbot'
import { FloatingButtonsToggle } from '@/components/ui/FloatingButtonsToggle'
import { LanguageProvider } from '@/context/LanguageContext'
import { ChatbotProvider } from '@/context/ChatbotContext'
import { FloatingButtonsProvider } from '@/context/FloatingButtonsContext'
import { useSessionManager } from '@/hooks/useSessionManager'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // Gérer la session et la déconnexion automatique
  useSessionManager()

  return (
    <LanguageProvider>
      <ChatbotProvider>
        <FloatingButtonsProvider>
          <CustomCursor />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <FloatingButtonsToggle />
          <WhatsAppBanner />
          <Chatbot />
          <CustomToaster />
        </FloatingButtonsProvider>
      </ChatbotProvider>
    </LanguageProvider>
  )
}



