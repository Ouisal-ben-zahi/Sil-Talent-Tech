'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowRight, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import HCaptchaWidget from '@/components/ui/HCaptcha'
import { isAuthenticated, getDashboardPath } from '@/lib/auth'

// Chemin vers l'image hero (dans public)
const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Connectez-vous à votre compte',
    pageTitleLine2: '',
    pageDescription: 'Bienvenue ! Veuillez sélectionner votre méthode de connexion',
    form: {
      email: 'Email / Nom d\'utilisateur',
      password: 'Mot de passe',
      showPassword: 'Afficher',
      hidePassword: 'Masquer',
      rememberMe: 'Souviens-toi de moi',
      forgotPassword: 'Mot de passe oublié ?',
      submit: 'Se Connecter',
      submitting: 'Connexion...',
    },
    separator: 'Ou connectez-vous avec',
    noAccount: 'Vous n\'avez pas de compte ?',
    signUp: 'S\'inscrire',
    loading: 'Chargement...',
    validation: {
      emailInvalid: 'Email invalide',
      passwordRequired: 'Le mot de passe est requis',
      captchaRequired: 'Veuillez compléter la vérification anti-spam',
    },
    messages: {
      loginSuccess: 'Connexion réussie !',
      accountCreated: 'Compte créé et connexion réussie !',
      alreadyLoggedIn: 'Vous êtes déjà connecté !',
      invalidCredentials: 'Email ou mot de passe incorrect.',
      noToken: 'Token d\'accès non reçu',
    },
    oauth: {
      google: 'Se connecter avec Google',
      facebook: 'Se connecter avec Facebook',
      linkedin: 'Se connecter avec LinkedIn',
    },
  },
  EN: {
    pageTitle: 'Sign in',
    pageTitleLine2: 'to your account',
    pageDescription: 'Welcome! Please select your login method',
    form: {
      email: 'Email / Username',
      password: 'Password',
      showPassword: 'Show',
      hidePassword: 'Hide',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      submit: 'Sign In',
      submitting: 'Signing in...',
    },
    separator: 'Or sign in with',
    noAccount: 'Don\'t have an account?',
    signUp: 'Sign up',
    loading: 'Loading...',
    validation: {
      emailInvalid: 'Invalid email',
      passwordRequired: 'Password is required',
      captchaRequired: 'Please complete the anti-spam verification',
    },
    messages: {
      loginSuccess: 'Login successful!',
      accountCreated: 'Account created and login successful!',
      alreadyLoggedIn: 'You are already logged in!',
      invalidCredentials: 'Email or password incorrect.',
      noToken: 'Access token not received',
    },
    oauth: {
      google: 'Sign in with Google',
      facebook: 'Sign in with Facebook',
      linkedin: 'Sign in with LinkedIn',
    },
  },
}

function createLoginSchema(t: typeof translations.FR) {
  return z.object({
    email: z.string().email(t.validation.emailInvalid),
    password: z.string().min(1, t.validation.passwordRequired),
  })
}

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>

// Composant pour l'image de fond texturée (BG Photo) - 100% largeur
function BackgroundPattern() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Pattern de particules lumineuses et ondes - couvre 100% de la largeur */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="particleGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        
        {/* Particules lumineuses - plus nombreuses et variées */}
        {Array.from({ length: 50 }).map((_, i) => {
          const x = (i * 150) % 1920 + Math.sin(i) * 50
          const y = (i * 80) % 1080 + Math.cos(i) * 50
          const r = 2 + (i % 3)
          return (
            <circle key={i} cx={x} cy={y} r={r} fill="url(#particleGradient)" />
          )
        })}
        
        {/* Ondes/réseau numérique */}
        <path
          d="M0,300 Q480,250 960,300 T1920,300"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M0,540 Q480,490 960,540 T1920,540"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M0,780 Q480,730 960,780 T1920,780"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
        
        {/* Lignes de connexion entre particules */}
        {Array.from({ length: 20 }).map((_, i) => {
          const x1 = (i * 200) % 1920
          const y1 = (i * 100) % 1080
          const x2 = ((i + 1) * 200) % 1920
          const y2 = ((i + 1) * 100) % 1080
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFFFFF"
              strokeWidth="0.5"
              opacity="0.2"
            />
          )
        })}
      </svg>
    </div>
  )
}

function LoginForm() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null)
  const [hCaptchaError, setHCaptchaError] = useState<string | null>(null)
  
  const loginSchema = createLoginSchema(t)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })
  
  const watchedPassword = watch('password', '')

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated()) {
      const dashboardPath = getDashboardPath()
      router.replace(dashboardPath)
    }
  }, [router])

  // Gérer le token OAuth depuis l'URL (retour du callback)
  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const isNewUser = searchParams.get('isNewUser') === 'true'
    
    if (error) {
      toast.error(decodeURIComponent(error))
      router.replace('/candidat/login')
    } else if (token) {
      localStorage.setItem('accessToken', token)
      sessionStorage.setItem('sessionActive', 'true')
      toast.success(isNewUser ? t.messages.accountCreated : t.messages.loginSuccess)
      router.replace('/candidat/dashboard')
    }
  }, [searchParams, router])

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'linkedin') => {
    const existingToken = localStorage.getItem('accessToken')
    
    if (existingToken) {
      try {
        const response = await api.get('/candidates/profile')
        
        if (response.data) {
          console.log('✅ Token valide trouvé, redirection vers le dashboard')
          toast.success(t.messages.alreadyLoggedIn)
          router.push('/candidat/dashboard')
          return
        }
      } catch (error: any) {
        console.log('⚠️ Token invalide ou expiré, suppression et redirection OAuth')
        localStorage.removeItem('accessToken')
      }
    }
    
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sil-talents.ma/api'
    
    if (!apiUrl.endsWith('/api')) {
      apiUrl = apiUrl.endsWith('/') ? `${apiUrl}api` : `${apiUrl}/api`
    }
    
    const oauthUrl = `${apiUrl}/auth/${provider}`
    console.log('🔐 Redirection OAuth:', { provider, oauthUrl })
    window.location.href = oauthUrl
  }

  const onSubmit = async (data: LoginFormData) => {
    // Vérifier que hCaptcha est validé
    if (!hCaptchaToken) {
      setHCaptchaError(t.validation.captchaRequired)
      toast.error(t.validation.captchaRequired)
      return
    }

    setIsSubmitting(true)
    setHCaptchaError(null)
    try {
      // Ne pas inclure hCaptchaToken si null ou undefined
      const payload: any = { ...data }
      if (hCaptchaToken) {
        payload.hCaptchaToken = hCaptchaToken
      }
      const response = await api.post('/auth/login', payload)
      
      const candidateData = response.data.data || response.data
      
      if (candidateData.accessToken) {
        localStorage.setItem('accessToken', candidateData.accessToken)
        sessionStorage.setItem('sessionActive', 'true')
        if (candidateData.firstName || candidateData.lastName || candidateData.fullName) {
          const name =
            candidateData.fullName ||
            `${candidateData.firstName || ''} ${candidateData.lastName || ''}`.trim()
          if (name) {
            localStorage.setItem('candidateName', name)
          }
        }
        toast.success(t.messages.loginSuccess)
        router.push('/candidat/dashboard')
      } else {
        toast.error(t.messages.noToken)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          t.messages.invalidCredentials
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
      {/* Section 1 : Connexion avec BG Photo - 100% largeur */}
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
                  {t.pageTitle}<br />{t.pageTitleLine2}
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
              {/* Email/Username */}
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
                    {showPassword ? t.form.hidePassword : t.form.showPassword}
                  </button>
                  </div>
                  {errors.password && (
                  <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-[#297BFF] border-2 border-sil-dark focus:ring-2 focus:ring-sil-accent cursor-pointer bg-sil-black"
                    />
                  <span className="text-sm" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}>{t.form.rememberMe}</span>
                  </label>
                  <Link
                    href="/candidat/mot-de-passe-oublie"
                  className="text-sm hover:opacity-80 transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#297BFF' }}
                  >
                    {t.form.forgotPassword}
                  </Link>
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
                style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px', color: 'white' }}
              >
                <span>{isSubmitting ? t.form.submitting : t.form.submit}</span>
                
              </button>

              {/* Séparateur */}
              <div className="relative py-4">
                <div className="relative flex justify-center items-center">
                  <div className="flex-1 border-t" style={{ borderColor: '#D9D9D9', borderWidth: '1px' }}></div>
                  <span className="px-6" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px', color: '#999999' }}>
                    {t.separator}
                  </span>
                  <div className="flex-1 border-t" style={{ borderColor: '#D9D9D9', borderWidth: '1px' }}></div>
                </div>
              </div>

              {/* Boutons OAuth - Cercles blancs avec logos colorés */}
              <div className="flex justify-center items-center gap-4">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  className="flex items-center justify-center hover:scale-110 transition-transform"
                  title={t.oauth.google}
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('facebook')}
                  className="flex items-center justify-center hover:scale-110 transition-transform"
                  title={t.oauth.facebook}
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('linkedin')}
                  className="flex items-center justify-center hover:scale-110 transition-transform"
                  title={t.oauth.linkedin}
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#0A66C2"
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.065 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                    />
                  </svg>
                </button>
              </div>

              {/* Lien vers inscription */}
              <div className="text-center pt-4">
                <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px', color: '#999999' }}>
                  {t.noAccount}{' '}
                  <Link
                    href="/candidat/inscription"
                    className="hover:opacity-80 transition-colors"
                    style={{ 
                      fontFamily: 'Inter', 
                      fontWeight: 400, 
                      fontSize: '18px', 
                      lineHeight: '23.29px', 
                      letterSpacing: '0%', 
                      verticalAlign: 'middle',
                      color: '#297BFF' 
                    }}
                  >
                    {t.signUp}
                  </Link>
                </p>
              </div>
              </form>
            </motion.div>
          </div>
      </section>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sil-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-sil-accent mx-auto mb-4"></div>
          <p className="text-sil-light">{translations.FR.loading}</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

