import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { clearAuthData, isAuthenticated, getUserType } from '@/lib/auth'

/**
 * Hook pour gérer la session utilisateur et la déconnexion automatique
 * 
 * Fonctionnalités :
 * - Déconnexion automatique si plusieurs onglets sont ouverts
 * - Déconnexion automatique lors du changement d'onglet
 * - Déconnexion automatique lors de la fermeture d'onglet
 * - Déconnexion automatique lors de la fermeture du navigateur/onglet
 * - Déconnexion automatique lors de la mise en veille/réveil de l'ordinateur
 * - Vérification de la session au chargement de la page
 */
export function useSessionManager() {
  const router = useRouter()
  const lastActiveTimeRef = useRef<number>(Date.now())
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const tabHeartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const tabIdRef = useRef<string>(`tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const isCleaningUpRef = useRef<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Marquer la session comme active au chargement
    sessionStorage.setItem('sessionActive', 'true')
    lastActiveTimeRef.current = Date.now()

    // Fonction pour nettoyer la session
    const cleanupSession = () => {
      if (isCleaningUpRef.current) return
      isCleaningUpRef.current = true

      const userType = getUserType()
      clearAuthData()
      
      // Nettoyer les données de suivi des onglets
      localStorage.removeItem('activeTabId')
      localStorage.removeItem('tabHeartbeat')
      
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
      localStorage.removeItem('activeTabId')
      localStorage.removeItem('tabHeartbeat')
      return
    }

    // ========== GESTION DES ONGLETS MULTIPLES ==========
    
    // Vérifier s'il y a déjà un onglet actif
    const checkMultipleTabs = () => {
      const activeTabId = localStorage.getItem('activeTabId')
      const tabHeartbeat = localStorage.getItem('tabHeartbeat')
      
      if (activeTabId && activeTabId !== tabIdRef.current) {
        // Il y a un autre onglet actif
        const heartbeatTime = tabHeartbeat ? parseInt(tabHeartbeat, 10) : 0
        const now = Date.now()
        const timeSinceHeartbeat = now - heartbeatTime
        
        // Si le heartbeat est récent (moins de 3 secondes), il y a un autre onglet actif
        if (timeSinceHeartbeat < 3000) {
          console.log('🚫 Plusieurs onglets détectés - déconnexion automatique')
          cleanupSession()
          return true
        } else {
          // Le heartbeat est ancien, l'autre onglet est probablement fermé
          // Cet onglet devient l'onglet actif
          localStorage.setItem('activeTabId', tabIdRef.current)
          localStorage.setItem('tabHeartbeat', Date.now().toString())
        }
      } else if (!activeTabId) {
        // Aucun onglet actif, cet onglet devient l'onglet actif
        localStorage.setItem('activeTabId', tabIdRef.current)
        localStorage.setItem('tabHeartbeat', Date.now().toString())
      }
      
      return false
    }

    // Vérifier immédiatement au chargement
    if (checkMultipleTabs()) {
      return
    }

    // Heartbeat pour maintenir l'onglet actif (toutes les secondes)
    tabHeartbeatIntervalRef.current = setInterval(() => {
      if (!isAuthenticated()) {
        return
      }

      const activeTabId = localStorage.getItem('activeTabId')
      
      // Si cet onglet est l'onglet actif, mettre à jour le heartbeat
      if (activeTabId === tabIdRef.current) {
        localStorage.setItem('tabHeartbeat', Date.now().toString())
      } else {
        // Vérifier si un autre onglet est toujours actif
        const tabHeartbeat = localStorage.getItem('tabHeartbeat')
        if (tabHeartbeat) {
          const heartbeatTime = parseInt(tabHeartbeat, 10)
          const now = Date.now()
          const timeSinceHeartbeat = now - heartbeatTime
          
          // Si le heartbeat est récent, déconnecter cet onglet
          if (timeSinceHeartbeat < 3000) {
            console.log('🚫 Autre onglet actif détecté - déconnexion automatique')
            cleanupSession()
          } else {
            // L'autre onglet est fermé, cet onglet devient actif
            localStorage.setItem('activeTabId', tabIdRef.current)
            localStorage.setItem('tabHeartbeat', Date.now().toString())
          }
        } else {
          // Aucun heartbeat, cet onglet devient actif
          localStorage.setItem('activeTabId', tabIdRef.current)
          localStorage.setItem('tabHeartbeat', Date.now().toString())
        }
      }
    }, 1000)

    // Écouter les changements dans localStorage (détection d'autres onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (!isAuthenticated() || isCleaningUpRef.current) return

      // Si un autre onglet change activeTabId ou tabHeartbeat
      if (e.key === 'activeTabId' || e.key === 'tabHeartbeat') {
        const activeTabId = localStorage.getItem('activeTabId')
        
        // Si un autre onglet devient actif et que ce n'est pas cet onglet
        if (activeTabId && activeTabId !== tabIdRef.current) {
          console.log('🚫 Changement d\'onglet détecté - déconnexion automatique')
          cleanupSession()
        }
      }
      
      // Si un autre onglet supprime le token, déconnecter aussi
      if (e.key === 'accessToken' && e.oldValue && !e.newValue) {
        console.log('🚫 Token supprimé par un autre onglet - déconnexion automatique')
        cleanupSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // ========== GESTION DE LA VISIBILITÉ ET CHANGEMENT D'ONGLET ==========

    // Gérer la mise en veille/réveil de l'ordinateur via visibilitychange
    const handleVisibilityChange = () => {
      if (!isAuthenticated() || isCleaningUpRef.current) return

      if (document.hidden) {
        // Page cachée (changement d'onglet ou mise en veille)
        console.log('👁️ Page cachée (changement d\'onglet détecté) - déconnexion automatique')
        
        // Retirer cet onglet de la liste des onglets actifs
        const activeTabId = localStorage.getItem('activeTabId')
        if (activeTabId === tabIdRef.current) {
          localStorage.removeItem('activeTabId')
          localStorage.removeItem('tabHeartbeat')
        }
        
        clearAuthData()
        cleanupSession()
      } else {
        // Page visible à nouveau
        // Vérifier si le token existe toujours
        if (!isAuthenticated()) {
          console.log('🔄 Réveil détecté - token déjà supprimé, redirection vers login')
          cleanupSession()
        } else {
          // Vérifier s'il y a d'autres onglets actifs
          if (checkMultipleTabs()) {
            return
          }
          // Mettre à jour le temps d'activité
          lastActiveTimeRef.current = Date.now()
        }
      }
    }

    // Gérer la perte de focus de la fenêtre
    const handleWindowBlur = () => {
      if (!isAuthenticated() || isCleaningUpRef.current) return
      
      // Quand la fenêtre perd le focus ET que la page est cachée,
      // cela indique probablement un changement d'onglet ou une mise en veille
      if (document.hidden) {
        console.log('🔌 Fenêtre perdue (changement d\'onglet) - déconnexion automatique')
        
        // Retirer cet onglet de la liste des onglets actifs
        const activeTabId = localStorage.getItem('activeTabId')
        if (activeTabId === tabIdRef.current) {
          localStorage.removeItem('activeTabId')
          localStorage.removeItem('tabHeartbeat')
        }
        
        clearAuthData()
        cleanupSession()
      }
    }

    // ========== GESTION DE LA FERMETURE D'ONGLET ==========

    // Gérer la fermeture de l'onglet/navigateur
    const handleBeforeUnload = () => {
      // Retirer cet onglet de la liste des onglets actifs
      const activeTabId = localStorage.getItem('activeTabId')
      if (activeTabId === tabIdRef.current) {
        localStorage.removeItem('activeTabId')
        localStorage.removeItem('tabHeartbeat')
      }
      
      // Supprimer le token lors de la fermeture
      clearAuthData()
    }

    // Gérer la fermeture de la session (pagehide - plus fiable que beforeunload)
    const handlePageHide = () => {
      // Retirer cet onglet de la liste des onglets actifs
      const activeTabId = localStorage.getItem('activeTabId')
      if (activeTabId === tabIdRef.current) {
        localStorage.removeItem('activeTabId')
        localStorage.removeItem('tabHeartbeat')
      }
      
      // Supprimer le token lors de la fermeture de l'onglet/navigateur
      clearAuthData()
    }

    // ========== DÉTECTION DE MISE EN VEILLE ==========

    // Fonction pour détecter la mise en veille en vérifiant le temps écoulé
    const checkSleepDetection = () => {
      if (!isAuthenticated() || isCleaningUpRef.current) return
      
      // Si la page est cachée, ne pas vérifier (visibilitychange gère déjà ce cas)
      if (document.hidden) {
        return
      }

      const now = Date.now()
      const timeSinceLastActive = now - lastActiveTimeRef.current
      
      // Si plus de 5 secondes se sont écoulées depuis la dernière vérification,
      // cela indique que le PC était probablement en veille
      if (timeSinceLastActive > 5000) {
        console.log('🛌 Détection de mise en veille (temps écoulé:', Math.round(timeSinceLastActive / 1000), 's) - déconnexion automatique')
        clearAuthData()
        cleanupSession()
        return
      }
      
      // Mettre à jour le temps de référence pour la prochaine vérification
      lastActiveTimeRef.current = now
    }

    // Heartbeat pour détecter la mise en veille
    heartbeatIntervalRef.current = setInterval(() => {
      if (isAuthenticated() && !isCleaningUpRef.current) {
        checkSleepDetection()
      }
    }, 1000)

    // ========== MISE À JOUR DE L'ACTIVITÉ ==========

    // Mettre à jour le temps d'activité lors des interactions utilisateur
    const updateActivityTime = () => {
      if (!isCleaningUpRef.current) {
        lastActiveTimeRef.current = Date.now()
      }
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
      if (tabHeartbeatIntervalRef.current) {
        clearInterval(tabHeartbeatIntervalRef.current)
      }
      
      // Retirer cet onglet de la liste des onglets actifs
      const activeTabId = localStorage.getItem('activeTabId')
      if (activeTabId === tabIdRef.current) {
        localStorage.removeItem('activeTabId')
        localStorage.removeItem('tabHeartbeat')
      }
      
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', updateActivityTime)
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('mousemove', updateActivityTime)
      document.removeEventListener('keydown', updateActivityTime)
      document.removeEventListener('click', updateActivityTime)
      document.removeEventListener('touchstart', updateActivityTime)
    }
  }, [router])
}
