/**
 * Utilitaires pour la gestion de l'authentification
 */

/**
 * Décode un token JWT et retourne son payload
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Erreur lors du décodage du token JWT:', error)
    return null
  }
}

/**
 * Vérifie si un token JWT est expiré
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true

  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true

    // exp est en secondes, Date.now() est en millisecondes
    const expirationTime = decoded.exp * 1000
    const currentTime = Date.now()

    return currentTime >= expirationTime
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error)
    return true
  }
}

/**
 * Récupère le token depuis localStorage et vérifie s'il est valide
 */
export function getValidToken(): string | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem('accessToken')
  if (!token) return null

  if (isTokenExpired(token)) {
    // Token expiré, le supprimer
    localStorage.removeItem('accessToken')
    localStorage.removeItem('candidateName')
    localStorage.removeItem('adminName')
    localStorage.removeItem('candidateProfilePicture')
    return null
  }

  return token
}

/**
 * Nettoie toutes les données d'authentification du localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('accessToken')
  localStorage.removeItem('candidateName')
  localStorage.removeItem('adminName')
  localStorage.removeItem('candidateProfilePicture')
  sessionStorage.removeItem('sessionActive')
}

/**
 * Vérifie si l'utilisateur est connecté et si son token est valide
 */
export function isAuthenticated(): boolean {
  return getValidToken() !== null
}

/**
 * Détermine le type d'utilisateur connecté (admin ou candidate)
 */
export function getUserType(): 'admin' | 'candidate' | null {
  if (typeof window === 'undefined') return null

  const token = getValidToken()
  if (!token) return null

  const adminName = localStorage.getItem('adminName')
  const candidateName = localStorage.getItem('candidateName')

  if (adminName) return 'admin'
  if (candidateName) return 'candidate'

  return null
}

/**
 * Obtient le dashboard approprié selon le type d'utilisateur
 */
export function getDashboardPath(): string {
  const userType = getUserType()
  if (userType === 'admin') return '/admin/dashboard'
  if (userType === 'candidate') return '/candidat/dashboard'
  return '/'
}


