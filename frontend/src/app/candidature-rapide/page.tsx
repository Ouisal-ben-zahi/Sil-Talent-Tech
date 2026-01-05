'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, FileText, CheckCircle, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { motion } from 'framer-motion'

// Même image de fond que login / inscription
const heroImagePath = '/assets/Images/hero.PNG'

const quickApplicationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Le numéro de téléphone est requis'),
  cv: z.any()
    .refine((files) => {
      if (typeof window === 'undefined') return true; // Skip validation on server
      return files && files.length > 0;
    }, 'Le CV est obligatoire')
    .refine((files) => {
      if (typeof window === 'undefined') return true; // Skip validation on server
      return files && files[0]?.type === 'application/pdf';
    }, 'Le fichier doit être un PDF')
    .refine((files) => {
      if (typeof window === 'undefined') return true; // Skip validation on server
      return files && files[0]?.size <= 10 * 1024 * 1024;
    }, 'Le fichier ne doit pas dépasser 10 Mo'),
})

type QuickApplicationFormData = z.infer<typeof quickApplicationSchema>

export default function QuickApplicationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cvFileName, setCvFileName] = useState<string>('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<QuickApplicationFormData>({
    resolver: zodResolver(quickApplicationSchema),
  })

  const cvFile = watch('cv')

  const handleRemoveCv = () => {
    setValue('cv', undefined as any)
    setCvFileName('')
    // Réinitialiser l'input file
    const fileInput = document.getElementById('cv') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const onSubmit = async (data: QuickApplicationFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('cv', data.cv[0])
      formData.append('source', 'quick_application')

      const response = await api.post('/candidates/quick-application', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(data) => data], // Important pour FormData
      })
      
      if (response.data.success) {
        toast.success('Candidature envoyée avec succès ! Nous vous contacterons rapidement.')
        reset()
        setCvFileName('')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
      toast.error(errorMessage)
      console.error('Erreur lors de l\'envoi de la candidature:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-sil-dark relative">
      {/* Section avec BG Photo - 100% largeur, même que login/inscription */}
      <section 
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url(${heroImagePath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay sombre identique */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
        {/* Gradient en bas identique */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
        
        {/* Contenu centré comme login/inscription */}
        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto h-full min-h-screen flex flex-col justify-between py-12 md:py-20">
          {/* Titre et sous-titre en haut à gauche */}
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
              className="mb-4 text-sil-white"
              style={{ 
                fontFamily: 'Inter', 
                fontWeight: 400, 
                fontStyle: 'normal', 
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginTop: '100px'
              }}
            >
              Candidature rapide
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
              style={{ fontFamily: 'Inter', fontWeight: 200, fontStyle: 'normal', fontSize: '18px', color: '#999999' }}
            >
              Déposez votre CV en quelques clics, sans créer de compte.
            </motion.p>
          </motion.div>

          {/* Bloc formulaire en bas, aligné à gauche, même style que les autres forms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-black/30 backdrop-blur-sm p-8 md:p-12 shadow-2xl max-w-2xl"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative">
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      className="w-full px-4 py-3 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('firstName') && (
                      <span
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                      >
                        Prénom<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      className="w-full px-4 py-3 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('lastName') && (
                      <span
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                      >
                        Nom<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                    placeholder=" "
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                  />
                  {!watch('email') && (
                    <span
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
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
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-3 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                    placeholder=" "
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                  />
                  {!watch('phone') && (
                    <span
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                    >
                      Téléphone<span className="text-[#297BFF]">*</span>
                    </span>
                  )}
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="cv" className="block text-sm font-semibold mb-2 text-[#D9D9D9]">
                  CV (PDF uniquement, max 10 Mo) *
                </label>
                <div className="relative">
                  <input
                    id="cv"
                    type="file"
                    accept="application/pdf"
                    {...register('cv', {
                      onChange: (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCvFileName(file.name)
                        }
                      },
                    })}
                    className="hidden"
                  />
                  {cvFileName ? (
                    <div className="border-2 border-sil-accent rounded-lg p-4 bg-black/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <FileText className="w-6 h-6 text-sil-accent flex-shrink-0" />
                          <span className="text-[#D9D9D9] font-medium truncate">{cvFileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCv}
                          className="ml-4 p-2 hover:bg-red-500/20 rounded-full transition-colors group flex-shrink-0"
                          aria-label="Retirer le CV"
                        >
                          <X className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="cv"
                      className="flex items-center justify-center space-x-3 border-2 border-dashed border-[#D9D9D9]/30 rounded-none p-8 cursor-pointer hover:border-sil-accent transition-colors bg-black/20"
                    >
                      <Upload className="w-6 h-6 text-[#297BFF]" />
                      <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}>
                        Cliquez pour télécharger votre CV
                      </span>
                    </label>
                  )}
                </div>
                {errors.cv && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.cv.message || '')}</p>
                )}
              </div>

              <div className="bg-black/30 rounded-lg p-4 flex items-start space-x-3 border border-[#D9D9D9]/20">
                <CheckCircle className="w-5 h-5 text-sil-accent mt-0.5 flex-shrink-0" />
                <div className="text-sm" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px', color: '#D9D9D9' }}>
                  <p className="font-semibold mb-1">Ce qui se passe ensuite :</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Votre CV est enregistré de manière sécurisée</li>
                    <li>Il est automatiquement transmis à notre équipe</li>
                    <li>Nous vous contacterons rapidement si votre profil correspond</li>
                  </ul>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sil-accent px-8 py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px', color: 'white' }}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>

              <div className="text-center pt-4 border-t border-[#D9D9D9]/20">
                <p className="mb-2" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}>
                  Vous préférez créer un compte pour suivre vos candidatures ?
                </p>
                <Link
                  href="/candidat/inscription"
                  className="hover:opacity-80 transition-colors inline-flex items-center space-x-1"
                  style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#297BFF' }}
                >
                  <span>Créer un compte candidat</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

