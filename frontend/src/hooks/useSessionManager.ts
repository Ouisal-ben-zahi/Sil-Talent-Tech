import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { clearAuthData, isAuthenticated, getUserType } from '@/lib/auth'

/**
 * Hook pour gérer la session utilisateur et la déconnexion automatique
 * 
 * Fonctionnalités :
 * - Déconnexion automatique lors de la fermeture du navigateur/onglet
 * - Déconnexion automatique lors de la mise en veille/réveil de l'ordinateur
 * - Vérification de la session au chargement de la page
 */
export function useSessionManager() {
  const router = useRouter()
  const lastActiveTimeRef = useRef<number>(Date.now())
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Marquer la session comme active au chargement
    sessionStorage.setItem('sessionActive', 'true')
    lastActiveTimeRef.current = Date.now()

    // Fonction pour nettoyer la session
    const cleanupSession = () => {
      const userType = getUserType()
      clearAuthData()
      
      // Rediriger vers la page de login appropriée
      if (userType === 'admin') {
        router.push('/admin/login')
      } else if (userType === 'candidate') {
        router.push('/candidat/login')
      }
    }

    // Vérifier si l'utilisateur est actuellement authentifié
    const isCurrentlyAuthenticated = isAuthenticated()

    // Si l'utilisateur n'est pas authentifié, nettoyer la session
    if (!isCurrentlyAuthenticated) {
      sessionStorage.removeItem('sessionActive')
      // Ne pas nettoyer complètement ici car l'utilisateur pourrait être sur une page publique
      // On laisse le Header gérer l'affichage
      return
    }

    // Fonction pour détecter la mise en veille en vérifiant le temps écoulé
    // Cette fonction vérifie si le PC était en veille en comparant le temps réel
    // avec le temps attendu (le heartbeat devrait se déclencher régulièrement)
    const checkSleepDetection = () => {
      const now = Date.now()
      const timeSinceLastActive = now - lastActiveTimeRef.current
      
      // Si plus de 10 secondes se sont écoulées depuis la dernière vérification,
      // cela indique que le PC était probablement en veille
      // (le heartbeat devrait se déclencher toutes les 2 secondes)
      // On utilise 10 secondes pour éviter les faux positifs dus à la latence
      if (timeSinceLastActive > 10000) {
        console.log('🛌 Détection de mise en veille (temps écoulé:', timeSinceLastActive, 'ms) - déconnexion automatique')
        clearAuthData()
        cleanupSession()
        return
      }
      
      // Mettre à jour le temps de référence pour la prochaine vérification
      lastActiveTimeRef.current = now
    }

    // Heartbeat pour détecter la mise en veille
    // Vérifie toutes les 2 secondes si le PC est toujours actif
    // Si le PC est en veille, le JavaScript ne s'exécute pas, donc quand il reprend,
    // on peut détecter qu'un long temps s'est écoulé
    heartbeatIntervalRef.current = setInterval(() => {
      if (isAuthenticated() && !document.hidden) {
        checkSleepDetection()
      }
    }, 2000)

    // Gérer la fermeture de l'onglet/navigateur
    const handleBeforeUnload = () => {
      // Supprimer le token lors de la fermeture
      clearAuthData()
    }

    // Gérer la mise en veille/réveil de l'ordinateur via visibilitychange
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page cachée (onglet inactif, ordinateur en veille)
        // Supprimer le token immédiatement
        console.log('👁️ Page cachée - déconnexion automatique')
        clearAuthData()
      } else {
        // Page visible à nouveau
        // Vérifier si le token est toujours valide
        if (!isAuthenticated()) {
          cleanupSession()
        } else {
          // Mettre à jour le temps d'activité
          lastActiveTimeRef.current = Date.now()
        }
      }
    }

    // Gérer la perte de focus de la fenêtre (mise en veille possible)
    const handleWindowBlur = () => {
      // Quand la fenêtre perd le focus, cela peut indiquer une mise en veille
      // On attend un peu avant de déconnecter pour éviter les faux positifs
      setTimeout(() => {
        if (document.hidden && isAuthenticated()) {
          console.log('🔌 Fenêtre perdue - déconnexion automatique')
          clearAuthData()
        }
      }, 1000)
    }

    // Gérer la fermeture de la session (pagehide - plus fiable que beforeunload)
    const handlePageHide = () => {
      // Supprimer le token lors de la fermeture de l'onglet/navigateur
      clearAuthData()
    }

    // Mettre à jour le temps d'activité lors des interactions utilisateur
    const updateActivityTime = () => {
      lastActiveTimeRef.current = Date.now()
    }

    // Ajouter les écouteurs d'événements
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', updateActivityTime)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Écouter les interactions utilisateur pour mettre à jour le temps d'activité
    document.addEventListener('mousemove', updateActivityTime)
    document.addEventListener('keydown', updateActivityTime)
    document.addEventListener('click', updateActivityTime)
    document.addEventListener('touchstart', updateActivityTime)

    // Nettoyer les écouteurs au démontage
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', updateActivityTime)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('mousemove', updateActivityTime)
      document.removeEventListener('keydown', updateActivityTime)
      document.removeEventListener('click', updateActivityTime)
      document.removeEventListener('touchstart', updateActivityTime)
    }
  }, [router])
}

