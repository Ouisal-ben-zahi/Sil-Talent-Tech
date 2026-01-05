'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/lib/api'

// Même image de fond que la page de connexion
const heroImagePath = '/assets/Images/hero.PNG'

const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
  resetCode: z.string()
    .length(6, 'Le code doit contenir exactement 6 chiffres')
    .regex(/^\d+$/, 'Le code doit contenir uniquement des chiffres'),
  newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Récupérer l'email depuis l'URL si présent
  const emailFromUrl = searchParams.get('email') || ''
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromUrl,
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true)
    try {
      const response = await api.post('/auth/reset-password', {
        email: data.email,
        resetCode: data.resetCode,
        newPassword: data.newPassword,
      })
      
      console.log('📥 Réponse complète du serveur:', response.data)
      
      if (response.data.success) {
        setIsSuccess(true)
        toast.success(response.data.message || 'Mot de passe réinitialisé avec succès !')
        
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push('/candidat/login')
        }, 2000)
      } else {
        toast.error(response.data.message || 'Une erreur est survenue.')
      }
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation:', error)
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
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

          {/* Contenu centré verticalement : titre + paragraphe + carte de succès, aligné à gauche */}
          <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto min-h-screen flex items-center justify-start py-12 md:py-20">
            <div className="w-full max-w-xl">
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
                  className="mb-4 mt-8 text-sil-white"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', fontSize: '56px' }}
                >
                  Mot de passe réinitialisé
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                  style={{ fontFamily: 'Inter', fontWeight: 200, fontStyle: 'normal', fontSize: '18px', color: '#999999' }}
                >
                  Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
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
                  <CheckCircle className="w-8 h-8 text-[#297BFF]" />
                </div>
                <h2
                  className="mb-4 text-white"
                  style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '32px' }}
                >
                  Mot de passe réinitialisé !
                </h2>
                <p
                  className="mb-6"
                  style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px', lineHeight: '28px', color: '#D9D9D9' }}
                >
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Link
                  href="/candidat/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#297BFF] hover:bg-[#1f63d6] text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px' }}
                >
                  <span>Se connecter</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
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
                className="mb-4 mt-8 text-sil-white"
                style={{ 
                  fontFamily: 'Inter', 
                  fontWeight: 400, 
                  fontStyle: 'normal', 
                  fontSize: 'clamp(28px, 4vw, 48px)' 
                }}
              >
                Réinitialiser le mot de passe
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
                style={{ fontFamily: 'Inter', fontWeight: 200, fontStyle: 'normal', fontSize: '18px', color: '#999999' }}
              >
                Entrez votre code de réinitialisation et votre nouveau mot de passe.
              </motion.p>
            </motion.div>

            {/* Formulaire de réinitialisation - même design que Inscription */}
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
                      disabled={!!emailFromUrl}
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('email') && !emailFromUrl && (
                      <span
                        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                      >
                        Email<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="resetCode"
                      type="text"
                      {...register('resetCode')}
                      className="w-full pl-4 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none text-center font-mono tracking-widest placeholder-transparent"
                      placeholder=" "
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('resetCode') && (
                      <span
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                      >
                        Code de réinitialisation (6 chiffres)<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.resetCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.resetCode.message}</p>
                  )}
                  <p className="text-[#999999] text-sm mt-1" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}>
                    Entrez le code à 6 chiffres reçu par email.
                  </p>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                    <input
                      id="newPassword"
                      type="password"
                      {...register('newPassword')}
                      className="w-full pl-10 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('newPassword') && (
                      <span
                        className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                      >
                        Nouveau mot de passe<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                    <input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      className="w-full pl-10 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('confirmPassword') && (
                      <span
                        className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                      >
                        Confirmer le nouveau mot de passe<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sil-accent px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 rounded-none"
                  style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '18px', color: 'white' }}
                >
                  <span>{isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}</span>
                </button>

                <div className="text-center pt-4 border-t border-white/10">
                  <Link
                    href="/candidat/login"
                    className="hover:opacity-80 transition-colors"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px', color: '#297BFF' }}
                  >
                    Retour à la connexion
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}




