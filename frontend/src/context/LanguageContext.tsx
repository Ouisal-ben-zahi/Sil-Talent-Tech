'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type LangCode = 'FR' | 'EN'

interface LanguageContextValue {
  lang: LangCode
  setLang: (lang: LangCode) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('FR')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('language')
    if (stored === 'EN' || stored === 'FR') {
      setLangState(stored)
    } else {
      // Détecter la langue du navigateur une seule fois
      const browserLang = window.navigator.language?.toLowerCase()
      if (browserLang.startsWith('en')) {
        setLangState('EN')
      } else {
        setLangState('FR')
      }
    }
  }, [])

  const setLang = (next: LangCode) => {
    setLangState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', next)
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
























