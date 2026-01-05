'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import HCaptchaWidget from '@/components/ui/HCaptcha'
import { isAuthenticated, getDashboardPath } from '@/lib/auth'

// Chemin vers l'image hero (dans public)
const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Connexion Administrateur',
    pageDescription: 'Accès réservé aux administrateurs',
    form: {
      email: 'Email',
      password: 'Mot de passe',
      show: 'Afficher',
      hide: 'Masquer',
      submit: 'Se Connecter',
      submitting: 'Connexion...',
      forgotPassword: 'Mot de passe oublié ?',
    },
    validation: {
      emailInvalid: 'Email invalide',
      passwordRequired: 'Le mot de passe est requis',
      captchaRequired: 'Veuillez compléter la vérification anti-spam',
    },
    messages: {
      success: 'Connexion réussie !',
      error: 'Identifiants invalides.',
      tokenError: 'Token d\'accès non reçu. Réponse: ',
    },
  },
  EN: {
    pageTitle: 'Administrator Login',
    pageDescription: 'Access restricted to administrators',
    form: {
      email: 'Email',
      password: 'Password',
      show: 'Show',
      hide: 'Hide',
      submit: 'Sign In',
      submitting: 'Signing in...',
      forgotPassword: 'Forgot password?',
    },
    validation: {
      emailInvalid: 'Invalid email',
      passwordRequired: 'Password is required',
      captchaRequired: 'Please complete the anti-spam verification',
    },
    messages: {
      success: 'Login successful!',
      error: 'Invalid credentials.',
      tokenError: 'Access token not received. Response: ',
    },
  },
}

function createAdminLoginSchema(t: typeof translations.FR) {
  return z.object({
    email: z.string().email(t.validation.emailInvalid),
    password: z.string().min(1, t.validation.passwordRequired),
  })
}

type AdminLoginFormData = z.infer<ReturnType<typeof createAdminLoginSchema>>

export default function AdminLoginPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang]
  const adminLoginSchema = createAdminLoginSchema(t)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null)
  const [hCaptchaError, setHCaptchaError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  })
  
  const watchedPassword = watch('password', '')

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated()) {
      const dashboardPath = getDashboardPath()
      router.replace(dashboardPath)
    }
  }, [router])

  const onSubmit = async (data: AdminLoginFormData) => {
    // Vérifier que hCaptcha est validé
    if (!hCaptchaToken) {
      setHCaptchaError(t.validation.captchaRequired || 'Veuillez compléter la vérification anti-spam')
      toast.error(t.validation.captchaRequired || 'Veuillez compléter la vérification anti-spam')
      return
    }

    setIsSubmitting(true)
    setHCaptchaError(null)
    try {
      console.log('🔐 Tentative de connexion admin...', data.email)
      // Ne pas inclure hCaptchaToken si null ou undefined
      const payload: any = { ...data }
      if (hCaptchaToken) {
        payload.hCaptchaToken = hCaptchaToken
      }
      const response = await api.post('/auth/admin/login', payload)
      console.log('✅ Réponse reçue:', response.data)
      
      // Le TransformInterceptor encapsule la réponse dans data
      const adminData = response.data.data || response.data
      console.log('📦 Données admin:', adminData)
      
      if (adminData?.accessToken) {
        // Nettoyer les données candidat avant de stocker les données admin
        localStorage.removeItem('candidateName')
        localStorage.removeItem('candidateProfilePicture')
        
        localStorage.setItem('accessToken', adminData.accessToken)
        sessionStorage.setItem('sessionActive', 'true')
        if (adminData.name || adminData.fullName) {
          const name = adminData.fullName || adminData.name
          if (name) {
            localStorage.setItem('adminName', name)
          }
        }
        console.log('✅ Token sauvegardé:', adminData.accessToken.substring(0, 20) + '...')
        toast.success(t.messages.success)
        router.push('/admin/dashboard')
      } else {
        console.error('❌ Pas de token dans la réponse:', adminData)
        toast.error(t.messages.tokenError + JSON.stringify(adminData))
      }
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error)
      console.error('❌ Détails erreur:', error.response?.data)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          t.messages.error
      toast.error(errorMessage)
      // Réinitialiser le captcha en cas d'erreur
      setHCaptchaToken(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCaptchaVerify = (token: string) => {
    setHCaptchaToken(token)
    setHCaptchaError(null)
  }

  const handleCaptchaExpire = () => {
    setHCaptchaToken(null)
    setHCaptchaError(null)
  }

  const handleCaptchaError = (error: string) => {
    setHCaptchaToken(null)
    setHCaptchaError(error)
  }

  return (
    <div className="min-h-screen bg-sil-dark relative">
      {/* Section avec BG Photo + overlay + gradient bas (comme Connexion candidat) */}
      <section 
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url(${heroImagePath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          }}
      >
        {/* Overlay sombre identique à la Hero section */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
        {/* Gradient en bas identique à la Hero */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
        
        {/* Contenu - 90% de la largeur, max 1200px, aligné à gauche */}
        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto h-full min-h-screen flex flex-col justify-center md:justify-between py-12 md:py-20">
          {/* Titre et paragraphe en haut à gauche */}
            <motion.div
            initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
                >
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-2 md:mb-4 mt-20 md:mt-16 text-sil-white"
              style={{ 
                fontFamily: 'Inter', 
                fontWeight: 400, 
                fontStyle: 'normal', 
                fontSize: 'clamp(28px, 4vw, 48px)' 
              }}
            >
              {t.pageTitle}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sil-white mb-4 md:mb-12"
              style={{ fontFamily: 'Inter', fontWeight: 200, fontStyle: 'normal', fontSize: '18px', color: '#999999' }}
                >
                  {t.pageDescription}
                </motion.p>
          </motion.div>

          {/* Formulaire en bas, aligné à gauche, fond gris transparent */}
                <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-black/30 backdrop-blur-sm p-8 md:p-12 shadow-2xl max-w-2xl"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              {/* Email */}
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="email"
                    type="text"
                        {...register('email')}
                    className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                    placeholder=" "
                    style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                  />
                  {!watch('email') && (
                    <span
                      className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                    >
                      {t.form.email}<span className="text-[#297BFF]">*</span>
                    </span>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="password"
                    type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                    className="w-full pl-12 pr-20 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                    placeholder=" "
                    style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                  />
                  {!watchedPassword && (
                    <span
                      className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                    >
                      {t.form.password}<span className="text-[#297BFF]">*</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#297BFF] hover:text-[#999999] text-sm font-medium transition-colors"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                  >
                    {showPassword ? t.form.hide : t.form.show}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
                  )}
              </div>

              {/* hCaptcha */}
              <div className="space-y-2">
                <HCaptchaWidget
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                  onError={handleCaptchaError}
                />
                {hCaptchaError && (
                  <p className="text-red-500 text-sm text-center">{hCaptchaError}</p>
                )}
              </div>

              {/* Bouton Se connecter */}
              <button
                  type="submit"
                  disabled={isSubmitting || !hCaptchaToken}
                className="w-full bg-sil-accent px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 rounded-none"
                style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '18px', color: 'white' }}
                >
                <span>{isSubmitting ? t.form.submitting : t.form.submit}</span>
              </button>

              {/* Lien Mot de passe oublié */}
              <div className="text-center pt-2">
                <Link
                  href="/admin/mot-de-passe-oublie"
                  className="hover:opacity-80 transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#297BFF' }}
                >
                  {t.form.forgotPassword}
                </Link>
              </div>
              </form>
            </motion.div>
        </div>
      </section>
    </div>
  )
}
