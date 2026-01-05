'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Routes critiques à précharger immédiatement
const CRITICAL_ROUTES = [
  '/',
  '/services',
  '/offres',
  '/contact',
  '/a-propos',
  '/candidature-rapide',
  '/ressources',
  '/services/cybersecurite',
  '/services/intelligence-artificielle',
  '/services/reseaux-telecom',
  '/services/conseil-expertise',
  // Routes dashboard (préchargées après vérification du token)
  '/candidat/dashboard',
  '/admin/dashboard',
]

export function usePrefetch() {
  const router = useRouter()

  useEffect(() => {
    // Précharger les routes critiques après le chargement initial
    const timer = setTimeout(() => {
      CRITICAL_ROUTES.forEach(route => {
        router.prefetch(route)
      })
    }, 1000) // Attendre 1 seconde après le chargement initial

    return () => clearTimeout(timer)
  }, [router])
}

// Hook pour précharger une route au survol d'un lien
export function useLinkPrefetch(href: string) {
  const router = useRouter()

  const handleMouseEnter = () => {
    router.prefetch(href)
  }

  return { onMouseEnter: handleMouseEnter }
}


