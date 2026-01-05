'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

// Même image de fond que la page de connexion
const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Mot de passe oublié ?',
    pageDescription: 'Entrez votre email pour recevoir un code de réinitialisation.',
    pageDescriptionSent: 'Email envoyé ! Vérifiez votre boîte mail pour récupérer votre code de réinitialisation.',
    form: {
      email: 'Votre email',
      submit: 'Envoyer le code de réinitialisation',
      submitting: 'Envoi...',
    },
    sent: {
      title: 'Email envoyé !',
      description: 'Vérifiez votre boîte mail pour recevoir votre code de réinitialisation à 6 chiffres.',
      enterCode: 'Entrer le code de réinitialisation',
      backToLogin: 'Retour à la connexion',
    },
    validation: {
      emailInvalid: 'Email invalide',
    },
    messages: {
      success: 'Email de réinitialisation envoyé !',
      error: 'Une erreur est survenue. Veuillez réessayer.',
      resetCode: 'Code de réinitialisation:',
    },
  },
  EN: {
    pageTitle: 'Forgot password?',
    pageDescription: 'Enter your email to receive a reset code.',
    pageDescriptionSent: 'Email sent! Check your mailbox to retrieve your reset code.',
    form: {
      email: 'Your email',
      submit: 'Send reset code',
      submitting: 'Sending...',
    },
    sent: {
      title: 'Email sent!',
      description: 'Check your mailbox to receive your 6-digit reset code.',
      enterCode: 'Enter reset code',
      backToLogin: 'Back to login',
    },
    validation: {
      emailInvalid: 'Invalid email',
    },
    messages: {
      success: 'Reset email sent!',
      error: 'An error occurred. Please try again.',
      resetCode: 'Reset code:',
    },
  },
}

function createForgotPasswordSchema(t: typeof translations.FR) {
  return z.object({
    email: z.string().email(t.validation.emailInvalid),
  })
}

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>

export default function ForgotPasswordPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const forgotPasswordSchema = createForgotPasswordSchema(t)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    try {
      const response = await api.post('/auth/forgot-password', {
        email: data.email,
      })
      
      console.log('📥 Réponse complète du serveur:', response.data)
      
      if (response.data.success) {
        // Sauvegarder l'email AVANT de changer l'état
        setUserEmail(data.email)
        setIsSent(true)
        
        // En développement, afficher le code dans la console et en toast
        if (response.data.resetCode) {
          console.log('═══════════════════════════════════════════════════════════')
          console.log('🔐 CODE DE RÉINITIALISATION (DEV)')
          console.log('🔐 CODE:', response.data.resetCode)
          console.log('═══════════════════════════════════════════════════════════')
          toast.success(`${t.messages.resetCode} ${response.data.resetCode}`, { 
            duration: 15000,
            style: {
              fontSize: '18px',
              fontWeight: 'bold',
            }
          })
        } else {
          toast.success(response.data.message || t.messages.success)
        }
      } else {
        toast.error(response.data.message || t.messages.error)
      }
    } catch (error: any) {
      console.error('Erreur lors de la demande de réinitialisation:', error)
      const errorMessage = error.response?.data?.message || t.messages.error
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen bg-sil-dark relative">
        {/* Section avec BG Photo + overlay + gradient bas (comme Connexion) */}
        <section 
          className="relative min-h-screen w-full overflow-hidden"
          style={{
            backgroundImage: `url(${heroImagePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />

          {/* Contenu centré verticalement : titre + paragraphe + carte, aligné à gauche */}
          <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto min-h-screen flex items-center justify-start py-12 md:py-20">
            <div className="w-full max-w-xl">
              {/* Titre */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-left mb-6"
              >
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 text-sil-white"
                  style={{ 
                    fontFamily: 'Inter', 
                    fontWeight: 400, 
                    fontStyle: 'normal', 
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    marginTop: '100px'
                  }}
                >
                  {t.pageTitle}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                  style={{ fontFamily: 'Inter', fontWeight: 200, fontStyle: 'normal', fontSize: '18px', color: '#999999' }}
                >
                  {t.pageDescriptionSent}
                </motion.p>
              </motion.div>

              {/* Carte de confirmation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-black/30 backdrop-blur-sm p-8 md:p-12 text-center"
              >
              <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-[#297BFF]" />
              </div>
              <h2
                className="mb-4 text-white"
                style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '32px' }}
              >
                {t.sent.title}
              </h2>
              <p
                className="mb-6"
                style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px', lineHeight: '28px', color: '#D9D9D9' }}
              >
                {t.sent.description}
              </p>
              <div className="space-y-3">
                <Link
                  href={`/candidat/reinitialiser-mot-de-passe${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ''}`}
                  className="w-full bg-[#297BFF] text-white px-6 py-3 flex items-center justify-center gap-2 hover:bg-[#1f63d6] transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px' }}
                >
                  <span>{t.sent.enterCode}</span>
                  
                </Link>
                <Link
                  href="/candidat/login"
                  className="inline-block mt-2 hover:opacity-80 transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#297BFF' }}
                >
                  {t.sent.backToLogin}
                </Link>
              </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sil-dark relative">
      {/* Section avec BG Photo + overlay + gradient bas (comme Connexion) */}
      <section 
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url(${heroImagePath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />

        {/* Contenu centré verticalement : titre + paragraphe + formulaire, aligné à gauche */}
        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto min-h-screen flex items-center justify-start py-12 md:py-20">
          <div className="w-full max-w-2xl">
            {/* Titre + paragraphe */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left mb-6"
            >
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4 text-sil-white"
                style={{ 
                  fontFamily: 'Inter', 
                  fontWeight: 400, 
                  fontStyle: 'normal', 
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  marginTop: '100px'
                }}
              >
                {t.pageTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
                style={{ fontFamily: 'Inter', fontWeight: 200, fontStyle: 'normal', fontSize: '18px', color: '#999999' }}
              >
                {t.pageDescription}
              </motion.p>
            </motion.div>

            {/* Formulaire avec carte sombre comme Connexion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-black/30 backdrop-blur-sm p-8 md:p-12"
            >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                  <input
                    id="email"
                    type="email"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sil-accent px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 rounded-none"
                style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '18px', color: 'white' }}
              >
                <span>{isSubmitting ? t.form.submitting : t.form.submit}</span>
              </button>

              <div className="text-center pt-4">
                <Link
                  href="/candidat/login"
                  className="hover:opacity-80 transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px', color: '#297BFF' }}
                >
                  {t.sent.backToLogin}
                </Link>
              </div>
            </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}



