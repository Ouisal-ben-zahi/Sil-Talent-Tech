import axios from 'axios'
import { getValidToken, clearAuthData } from './auth'

// S'assurer que l'URL se termine par /api
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://168.231.82.55:3001/api'
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fonction helper pour les requêtes avec FormData
export const apiFormData = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Intercepteur pour ajouter le token JWT aux requêtes FormData
apiFormData.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getValidToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getValidToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Ne pas définir Content-Type pour FormData, laisser le navigateur le faire
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
  }
  return config
})

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        clearAuthData()
        
        // Rediriger vers la bonne page de login selon le contexte
        if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin/login'
        } else {
          window.location.href = '/candidat/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api

