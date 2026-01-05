'use client'

import { useRef, useEffect, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useLanguage } from '@/context/LanguageContext'

interface HCaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: (error: string) => void
  className?: string
}

export default function HCaptchaWidget({ onVerify, onExpire, onError, className = '' }: HCaptchaProps) {
  const captchaRef = useRef<HCaptcha>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { lang } = useLanguage()

  // Site key depuis les variables d'environnement
  // Nettoyer la clé (supprimer les espaces, retours à la ligne, préfixes invalides, etc.)
  const rawSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''
  let cleanedSiteKey = rawSiteKey.trim().replace(/\s+/g, '')
  
  // Supprimer les préfixes invalides courants (ES_, hcaptcha_, etc.)
  cleanedSiteKey = cleanedSiteKey.replace(/^(ES_|hcaptcha_|HCAPTCHA_)/i, '')
  
  // Si la clé nettoyée est vide ou invalide, utiliser la clé de test
  const siteKey = cleanedSiteKey && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanedSiteKey)
    ? cleanedSiteKey
    : '10000000-ffff-ffff-ffff-000000000001' // Clé de test par défaut

  // Log pour déboguer (uniquement en développement)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Configuration hCaptcha Frontend:', {
        hasRawKey: !!rawSiteKey,
        rawKeyLength: rawSiteKey.length,
        rawKeyPreview: rawSiteKey.substring(0, 50),
        cleanedKey: siteKey.substring(0, 30) + '...',
        isTestKey: siteKey === '10000000-ffff-ffff-ffff-000000000001',
      })
      
      // Vérifier si on utilise la clé de test à cause d'une clé invalide
      if (rawSiteKey && rawSiteKey.trim() !== '' && siteKey === '10000000-ffff-ffff-ffff-000000000001') {
        console.warn('⚠️ Clé hCaptcha invalide détectée. Utilisation de la clé de test.')
        console.warn('⚠️ Clé originale:', rawSiteKey)
        console.warn('⚠️ Format attendu: UUID (ex: 10000000-ffff-ffff-ffff-000000000001)')
        console.warn('⚠️ Vérifiez votre fichier .env.local et consultez HCAPTCHA_FIX.md')
        setError('Clé hCaptcha invalide détectée. Utilisation de la clé de test.')
      } else if (rawSiteKey && rawSiteKey.trim() !== '') {
        console.log('✅ Clé hCaptcha valide détectée')
      }
    }
  }, [siteKey, rawSiteKey])

  const handleVerify = (token: string) => {
    setIsVerified(true)
    onVerify(token)
  }

  const handleExpire = () => {
    setIsVerified(false)
    if (onExpire) {
      onExpire()
    }
  }

  const handleError = (error: string) => {
    setIsVerified(false)
    console.error('❌ Erreur hCaptcha:', error)
    setError(`Erreur hCaptcha: ${error}`)
    if (onError) {
      onError(error)
    }
  }

  // Fonction pour réinitialiser le captcha (utile après une erreur)
  const reset = () => {
    if (captchaRef.current) {
      captchaRef.current.resetCaptcha()
      setIsVerified(false)
    }
  }

  // Exposer la fonction reset via ref (pour usage externe si nécessaire)
  useEffect(() => {
    if (captchaRef.current) {
      ;(captchaRef.current as any).reset = reset
    }
  }, [])

  // Si erreur de format, afficher un message
  if (error && error.includes('Clé hCaptcha invalide')) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-red-900/20 border border-red-500/50 rounded ${className}`}>
        <p className="text-red-400 text-sm text-center mb-2">
          ⚠️ Configuration hCaptcha invalide
        </p>
        <p className="text-red-300 text-xs text-center">
          Vérifiez que NEXT_PUBLIC_HCAPTCHA_SITE_KEY dans .env.local est au format UUID valide
        </p>
        <p className="text-gray-400 text-xs text-center mt-2">
          Format attendu: 10000000-ffff-ffff-ffff-000000000001
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
        theme="dark"
        size="normal"
        languageOverride={lang === 'EN' ? 'en' : 'fr'}
      />
      {error && !error.includes('Clé hCaptcha invalide') && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  )
}

