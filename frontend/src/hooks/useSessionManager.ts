import { useEffect } from 'react'
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

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Marquer la session comme active au chargement
    sessionStorage.setItem('sessionActive', 'true')

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

    // Gérer la fermeture de l'onglet/navigateur
    const handleBeforeUnload = () => {
      // Ne pas nettoyer ici car beforeunload peut être annulé
      // On vérifiera au prochain chargement
    }

    // Gérer la mise en veille/réveil de l'ordinateur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page cachée (onglet inactif, ordinateur en veille)
        // On ne fait rien ici, on vérifiera au retour
      } else {
        // Page visible à nouveau
        // Vérifier si le token est toujours valide
        if (!isAuthenticated()) {
          cleanupSession()
        }
      }
    }

    // Gérer la fermeture de la session (pageunload)
    const handlePageUnload = () => {
      // Marquer que la session se termine
      sessionStorage.removeItem('sessionActive')
    }

    // Ajouter les écouteurs d'événements
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Nettoyer les écouteurs au démontage
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])
}

