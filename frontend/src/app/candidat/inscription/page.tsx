'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowRight, Upload, FileText, X, CheckCircle, User, Mail, Phone, Lock, Linkedin, Globe, Briefcase, MapPin, ChevronDown, ClipboardList, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { RiPsychotherapyLine } from "react-icons/ri"
import { useLanguage } from '@/context/LanguageContext'

// Chemin vers l'image hero (dans public)
const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Formulaire d\'inscription',
    pageDescription: 'Inscrivez-vous pour postuler aux emplois de votre choix',
    loading: 'Chargement...',
    steps: {
      step: 'Étape',
      of: 'sur',
      step1: 'Renseignez vos informations personnelles et de connexion.',
      step2: 'Ajoutez vos liens professionnels et votre niveau d\'expertise.',
      step3: 'Complétez votre localisation et téléchargez votre CV.',
    },
    form: {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      linkedin: 'LinkedIn',
      portfolio: 'Portfolio',
      jobTitle: 'Poste recherché',
      expertiseLevel: 'Niveau d\'expertise',
      expertiseLevels: {
        junior: 'Junior',
        confirme: 'Confirmé',
        senior: 'Senior',
        expert: 'Expert',
      },
      country: 'Pays',
      city: 'Ville',
      missionType: 'Type de mission',
      category: 'Catégorie principale',
      cv: 'Cliquez pour télécharger votre CV',
      removeCv: 'Retirer le CV',
      previous: 'Précédent',
      next: 'Suivant',
      submit: 'S\'inscrire',
      submitting: 'Inscription en cours...',
    },
    missionTypes: {
      CDI: 'CDI',
      CDD: 'CDD',
      stage: 'Stage',
      freelance: 'Freelance',
      autre: 'Autre',
    },
    validation: {
      firstNameMin: 'Le prénom doit contenir au moins 2 caractères',
      lastNameMin: 'Le nom doit contenir au moins 2 caractères',
      emailInvalid: 'Email invalide',
      phoneRequired: 'Le numéro de téléphone est requis',
      passwordMin: 'Le mot de passe doit contenir au moins 8 caractères',
      passwordsNotMatch: 'Les mots de passe ne correspondent pas',
      linkedinInvalid: 'URL LinkedIn invalide',
      portfolioInvalid: 'URL invalide',
      cvRequired: 'Le CV est obligatoire',
      cvPdf: 'Le fichier doit être un PDF ou Word (.doc, .docx)',
      cvSize: 'Le fichier ne doit pas dépasser 10 Mo',
      cvInvalid: 'Le fichier envoyé n\'est pas reconnu comme un CV valide',
      jobTitleRequired: 'Le poste recherché est obligatoire',
      expertiseLevelRequired: 'Le niveau d\'expertise est obligatoire',
      missionTypeRequired: 'Le type de mission est obligatoire',
      categoryRequired: 'La catégorie principale est obligatoire',
    },
    messages: {
      oauthSuccess: (provider: string) => `Connexion ${provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'LinkedIn'} réussie ! Complétez votre inscription.`,
      oauthConnected: (provider: string) => `Connexion ${provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'LinkedIn'} réussie !`,
      oauthComplete: 'Vos informations ont été pré-remplies. Complétez le formulaire pour finaliser votre inscription.',
      alreadyLoggedIn: 'Vous êtes déjà connecté !',
      success: 'Compte créé avec succès ! Vous allez être redirigé...',
      error: 'Une erreur est survenue. Veuillez réessayer.',
    },
    separator: 'Ou inscrivez-vous avec',
    haveAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter',
  },
  EN: {
    pageTitle: 'Registration form',
    pageDescription: 'Sign up to apply for jobs of your choice',
    loading: 'Loading...',
    steps: {
      step: 'Step',
      of: 'of',
      step1: 'Enter your personal and account information.',
      step2: 'Add your professional links and expertise level.',
      step3: 'Complete your location and upload your CV.',
    },
    form: {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      confirmPassword: 'Confirm password',
      linkedin: 'LinkedIn',
      portfolio: 'Portfolio',
      jobTitle: 'Desired position',
      expertiseLevel: 'Expertise level',
      expertiseLevels: {
        junior: 'Junior',
        confirme: 'Confirmed',
        senior: 'Senior',
        expert: 'Expert',
      },
      country: 'Country',
      city: 'City',
      missionType: 'Mission type',
      category: 'Main category',
      cv: 'Click to upload your CV',
      removeCv: 'Remove CV',
      previous: 'Previous',
      next: 'Next',
      submit: 'Sign up',
      submitting: 'Signing up...',
    },
    missionTypes: {
      CDI: 'Permanent',
      CDD: 'Fixed-term',
      stage: 'Internship',
      freelance: 'Freelance',
      autre: 'Other',
    },
    validation: {
      firstNameMin: 'First name must contain at least 2 characters',
      lastNameMin: 'Last name must contain at least 2 characters',
      emailInvalid: 'Invalid email',
      phoneRequired: 'Phone number is required',
      passwordMin: 'Password must contain at least 8 characters',
      passwordsNotMatch: 'Passwords do not match',
      linkedinInvalid: 'Invalid LinkedIn URL',
      portfolioInvalid: 'Invalid URL',
      cvRequired: 'CV is required',
      cvPdf: 'File must be a PDF or Word (.doc, .docx)',
      cvSize: 'File must not exceed 10 MB',
      cvInvalid: 'The uploaded file is not recognized as a valid CV',
      jobTitleRequired: 'Desired position is required',
      expertiseLevelRequired: 'Expertise level is required',
      missionTypeRequired: 'Mission type is required',
      categoryRequired: 'Main category is required',
    },
    messages: {
      oauthSuccess: (provider: string) => `${provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'LinkedIn'} connection successful! Complete your registration.`,
      oauthConnected: (provider: string) => `${provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'LinkedIn'} connection successful!`,
      oauthComplete: 'Your information has been pre-filled. Complete the form to finalize your registration.',
      alreadyLoggedIn: 'You are already logged in!',
      success: 'Account created successfully! You will be redirected...',
      error: 'An error occurred. Please try again.',
    },
    separator: 'Or sign up with',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
  },
}

function createRegistrationSchema(t: typeof translations.FR) {
  // Create a FileList validator that works in both SSR and browser environments
  // Use z.any() with custom refinement to avoid FileList reference during SSR
  const cvValidator = z.any()
    .refine((files) => {
      if (typeof window === 'undefined') return true // Skip validation during SSR
      if (!files) return false
      // Check if it's a FileList-like object
      if (typeof files !== 'object' || !('length' in files)) return false
      if (files.length === 0) return false
      return true
    }, t.validation.cvRequired)
    .refine((files) => {
      if (typeof window === 'undefined') return true // Skip validation during SSR
      if (!files || !files[0]) return true
      const allowedTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      ]
      return allowedTypes.includes(files[0]?.type)
    }, t.validation.cvPdf)
    .refine((files) => {
      if (typeof window === 'undefined') return true // Skip validation during SSR
      if (!files || !files[0]) return true
      return files[0]?.size <= 10 * 1024 * 1024
    }, t.validation.cvSize)
  
  return z.object({
    firstName: z.string().min(2, t.validation.firstNameMin),
    lastName: z.string().min(2, t.validation.lastNameMin),
    email: z.string().email(t.validation.emailInvalid),
    phone: z.string().min(10, t.validation.phoneRequired),
    password: z.string().min(8, t.validation.passwordMin),
    confirmPassword: z.string(),
    linkedin: z.string().url(t.validation.linkedinInvalid).optional().or(z.literal('')),
    portfolio: z.string().url(t.validation.portfolioInvalid).optional().or(z.literal('')),
      jobTitle: z.string().min(1, t.validation.jobTitleRequired),
      expertiseLevel: z.enum(['junior', 'confirme', 'senior', 'expert'], {
        required_error: t.validation.expertiseLevelRequired,
      }),
      country: z.string().optional(),
      city: z.string().optional(),
      typeDeMission: z.enum(['CDI', 'CDD', 'stage', 'freelance', 'autre'], {
        required_error: t.validation.missionTypeRequired,
      }),
      categoriePrincipaleId: z.string().min(1, t.validation.categoryRequired),
    cv: cvValidator,
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.validation.passwordsNotMatch,
    path: ['confirmPassword'],
  })
}

type RegistrationFormData = z.infer<ReturnType<typeof createRegistrationSchema>>

function RegistrationForm() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cvFileName, setCvFileName] = useState<string>('')
  const [isOAuth, setIsOAuth] = useState(false)
  const [oauthProvider, setOauthProvider] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMissionDropdownOpen, setIsMissionDropdownOpen] = useState(false)
  const [isCategorieDropdownOpen, setIsCategorieDropdownOpen] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; nom: string }>>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [isMobile, setIsMobile] = useState(false)
  
  const registrationSchema = createRegistrationSchema(t)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  })

  // Pré-remplir le formulaire avec les données OAuth depuis l'URL
  useEffect(() => {
    const email = searchParams.get('email')
    const firstName = searchParams.get('firstName')
    const lastName = searchParams.get('lastName')
    const provider = searchParams.get('provider')
    const oauth = searchParams.get('oauth') === 'true'

    if (oauth && email && firstName && lastName) {
      setIsOAuth(true)
      setOauthProvider(provider || '')
      setValue('email', email)
      setValue('firstName', firstName)
      setValue('lastName', lastName)
      toast.success(t.messages.oauthSuccess(provider || ''))
    }
  }, [searchParams, setValue])

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        console.log('🔄 Tentative de chargement des catégories...')
        const response = await api.get('/categories')
        console.log('✅ Réponse catégories complète:', response)
        console.log('📦 response.data:', response.data)
        
        // Gérer différents formats de réponse
        let categoriesData = null
        if (response.data) {
          if (Array.isArray(response.data)) {
            categoriesData = response.data
            console.log('✅ Format: Array direct,', categoriesData.length, 'catégorie(s)')
          } else if (response.data.data && Array.isArray(response.data.data)) {
            categoriesData = response.data.data
            console.log('✅ Format: response.data.data,', categoriesData.length, 'catégorie(s)')
          } else if (response.data.categories && Array.isArray(response.data.categories)) {
            categoriesData = response.data.categories
            console.log('✅ Format: response.data.categories,', categoriesData.length, 'catégorie(s)')
          } else {
            console.warn('⚠️ Format de réponse inattendu pour les catégories:', response.data)
            categoriesData = []
          }
        } else {
          console.warn('⚠️ response.data est null ou undefined')
          categoriesData = []
        }
        
        setCategories(categoriesData || [])
        
        if (!categoriesData || categoriesData.length === 0) {
          console.warn('⚠️ Aucune catégorie trouvée dans la réponse')
        } else {
          console.log('✅ Catégories chargées avec succès:', categoriesData)
        }
      } catch (error: any) {
        console.error('❌ Erreur lors du chargement des catégories:', error)
        console.error('📋 Détails complets de l\'erreur:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
          }
        })
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  // Détecter le mode mobile pour activer le multi-step
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.expertise-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

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

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    try {
      // Créer FormData pour envoyer les données + CV en une seule requête
      const formData = new FormData()
      
      // Ajouter les données du formulaire
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('password', data.password)
      if (data.linkedin) formData.append('linkedin', data.linkedin)
      if (data.portfolio) formData.append('portfolio', data.portfolio)
      formData.append('jobTitle', data.jobTitle)
      formData.append('expertiseLevel', data.expertiseLevel)
      if (data.country) formData.append('country', data.country)
      if (data.city) formData.append('city', data.city)
      formData.append('typeDeMissionSouhaite', data.typeDeMission)
      formData.append('categoriePrincipaleId', data.categoriePrincipaleId)
      formData.append('source', 'portal_registration')
      
      // Ajouter le CV si fourni
      if (data.cv && data.cv[0]) {
        formData.append('cv', data.cv[0])
      }

      const registerResponse = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      console.log('✅ Réponse d\'inscription complète:', registerResponse.data)
      
      // Sauvegarder le token
      // Le TransformInterceptor encapsule dans data.data
      const responseData = registerResponse.data.data || registerResponse.data
      const token = responseData?.accessToken || registerResponse.data.accessToken
      
      if (token) {
        localStorage.setItem('accessToken', token)
        console.log('✅ Token stocké dans localStorage:', token.substring(0, 20) + '...')
        console.log('✅ Données candidat:', {
          id: responseData?.id || responseData?.candidate?.id,
          email: responseData?.email || responseData?.candidate?.email,
        })
        const firstName = responseData?.firstName || responseData?.candidate?.firstName
        const lastName = responseData?.lastName || responseData?.candidate?.lastName
        const fullName = responseData?.fullName
        const name = fullName || `${firstName || ''} ${lastName || ''}`.trim()
        if (name) {
          localStorage.setItem('candidateName', name)
        }
      } else {
        console.error('❌ Aucun token trouvé dans la réponse:', registerResponse.data)
      }
      
      toast.success(t.messages.success)
      setTimeout(() => {
        router.push('/candidat/dashboard')
      }, 1500)
    } catch (error: any) {
      // Gérer les erreurs de validation du CV
      let errorMessage = error.response?.data?.message || error.response?.data?.error || t.messages.error
      
      // Si c'est une erreur de validation de CV, afficher un message spécifique
      if (errorMessage.includes('Inscription refusée') || errorMessage.includes('fichier non valide') || errorMessage.includes('n\'est pas reconnu comme un CV')) {
        errorMessage = errorMessage // Utiliser le message détaillé du backend
      } else if (error.response?.status === 400 && errorMessage.includes('CV')) {
        // Autres erreurs liées au CV
        errorMessage = t.validation.cvInvalid + ': ' + errorMessage
      }
      
      toast.error(errorMessage, {
        duration: 6000, // Afficher plus longtemps pour les erreurs de validation
      })
      console.error('Erreur lors de la création du compte:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-sil-dark relative">
      {/* Section avec BG Photo - 100% largeur */}
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
        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto h-full min-h-screen flex flex-col justify-between py-12 md:py-20">
          {/* Titre et paragraphe en haut à gauche */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left mt-32 md:mt-24"
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
                fontSize: 'clamp(28px, 4vw, 48px)' 
              }}
            >
              {t.pageTitle}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className=" mb-12"
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
            {isOAuth && (
              <div className="mb-6 bg-green-500/20 border-2 border-green-400/50 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-200">
                  <p className="font-semibold mb-1">
                    {t.messages.oauthConnected(oauthProvider)}
                  </p>
                  <p>
                    {t.messages.oauthComplete}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Indicateur d'étapes sur mobile */}
              {isMobile && (
                <div className="mb-4">
                  <p
                    style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#D9D9D9' }}
                  >
                    {t.steps.step} {currentStep} {t.steps.of} {totalSteps}
                  </p>
                  <p
                    className="mt-1"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px', color: '#999999' }}
                  >
                    {currentStep === 1 && t.steps.step1}
                    {currentStep === 2 && t.steps.step2}
                    {currentStep === 3 && t.steps.step3}
                  </p>
                </div>
              )}

              {/* ÉTAPE 1 : Infos personnelles & compte */}
              {(!isMobile || currentStep === 1) && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="firstName"
                        type="text"
                        {...register('firstName')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                        placeholder=" "
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                      {!watch('firstName') && (
                        <span
                          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                          style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                        >
                          {t.form.firstName}<span className="text-[#297BFF]">*</span>
                        </span>
                      )}
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-2">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="lastName"
                        type="text"
                        {...register('lastName')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                        placeholder=" "
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                      {!watch('lastName') && (
                        <span
                          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                          style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                        >
                          {t.form.lastName}<span className="text-[#297BFF]">*</span>
                        </span>
                      )}
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-2">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      readOnly={isOAuth}
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('email') && !isOAuth && (
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

                <div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('phone') && (
                      <span
                        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                      >
                        {t.form.phone}<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-2">{errors.phone.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="password"
                        type="password"
                        {...register('password')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                        placeholder=" "
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                      {!watch('password') && (
                        <span
                          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                          style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                        >
                          {t.form.password}<span className="text-[#297BFF]">*</span>
                        </span>
                      )}
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                        placeholder=" "
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                      {!watch('confirmPassword') && (
                        <span
                          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                          style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                        >
                          {t.form.confirmPassword}<span className="text-[#297BFF]">*</span>
                        </span>
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-2">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                </>
              )}

              {/* ÉTAPE 2 : Présence en ligne & expertise */}
              {(!isMobile || currentStep === 2) && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative">
                      <Linkedin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="linkedin"
                        type="url"
                        {...register('linkedin')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none"
                        placeholder={t.form.linkedin}
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                    </div>
                    {errors.linkedin && (
                      <p className="text-red-500 text-sm mt-2">{errors.linkedin.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="portfolio"
                        type="url"
                        {...register('portfolio')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none"
                        placeholder={t.form.portfolio}
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                    </div>
                    {errors.portfolio && (
                      <p className="text-red-500 text-sm mt-2">{errors.portfolio.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="jobTitle"
                        type="text"
                        {...register('jobTitle')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none"
                        placeholder={t.form.jobTitle}
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                      {!watch('jobTitle') && (
                        <span
                          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                          style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                        >
                          {t.form.jobTitle}<span className="text-[#297BFF]">*</span>
                        </span>
                      )}
                    </div>
                    {errors.jobTitle && (
                      <p className="text-red-500 text-sm mt-2">{errors.jobTitle.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative expertise-dropdown">
                      {/* Champ de saisie avec icônes */}
                      <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                          isDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]'
                        } hover:bg-[#2A2A2A] hover:shadow-lg`}
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      >
                        <ClipboardList className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                        <span className="block">
                          {watch('expertiseLevel') === 'junior' ? t.form.expertiseLevels.junior :
                           watch('expertiseLevel') === 'confirme' ? t.form.expertiseLevels.confirme :
                           watch('expertiseLevel') === 'senior' ? t.form.expertiseLevels.senior :
                           watch('expertiseLevel') === 'expert' ? t.form.expertiseLevels.expert :
                           t.form.expertiseLevel}
                          {!watch('expertiseLevel') && <span className="text-[#297BFF]">*</span>}
                        </span>
                        <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        {/* Ligne bleue active en dessous */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                      </div>
                      
                      {/* Options déroulantes */}
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('expertiseLevel', 'junior')
                                setIsDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                            >
                              {t.form.expertiseLevels.junior}
                            </div>
                          </div>
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('expertiseLevel', 'confirme')
                                setIsDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                            >
                              {t.form.expertiseLevels.confirme}
                            </div>
                          </div>
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('expertiseLevel', 'senior')
                                setIsDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                            >
                              {t.form.expertiseLevels.senior}
                            </div>
                          </div>
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('expertiseLevel', 'expert')
                                setIsDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                            >
                              {t.form.expertiseLevels.expert}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Input caché pour react-hook-form */}
                      <input
                        type="hidden"
                        {...register('expertiseLevel')}
                      />
                    </div>
                    {errors.expertiseLevel && (
                      <p className="text-red-500 text-sm mt-2">{errors.expertiseLevel.message}</p>
                    )}
                  </div>
                </div>
                </>
              )}

              {/* ÉTAPE 3 : Localisation & CV */}
              {(!isMobile || currentStep === 3) && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="country"
                        type="text"
                        {...register('country')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none"
                        placeholder={t.form.country}
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="city"
                        type="text"
                        {...register('city')}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none"
                        placeholder={t.form.city}
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Type de mission et Compétence principale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type de mission */}
                  <div>
                    <div className="relative mission-dropdown">
                      <ClipboardList className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                      <div
                        onClick={() => {
                          setIsMissionDropdownOpen(!isMissionDropdownOpen)
                          setIsCategorieDropdownOpen(false)
                        }}
                        className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                          isMissionDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                        } hover:bg-[#2A2A2A] hover:shadow-lg`}
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      >
                        <span className="block">
                          {watch('typeDeMission') === 'CDI' ? t.missionTypes.CDI :
                           watch('typeDeMission') === 'CDD' ? t.missionTypes.CDD :
                           watch('typeDeMission') === 'stage' ? t.missionTypes.stage :
                           watch('typeDeMission') === 'freelance' ? t.missionTypes.freelance :
                           watch('typeDeMission') === 'autre' ? t.missionTypes.autre :
                           t.form.missionType}
                          {!watch('typeDeMission') && <span className="text-[#297BFF]">*</span>}
                        </span>
                        <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isMissionDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {isMissionDropdownOpen && (
                        <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('typeDeMission', 'CDI')
                                setIsMissionDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                            >
                              {t.missionTypes.CDI}
                            </div>
                          </div>
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('typeDeMission', 'CDD')
                                setIsMissionDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                            >
                              {t.missionTypes.CDD}
                            </div>
                          </div>
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('typeDeMission', 'stage')
                                setIsMissionDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                            >
                              {t.missionTypes.stage}
                            </div>
                          </div>
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('typeDeMission', 'freelance')
                                setIsMissionDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                            >
                              {t.missionTypes.freelance}
                            </div>
                          </div>
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('typeDeMission', 'autre')
                                setIsMissionDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                            >
                              {t.missionTypes.autre}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <input
                        type="hidden"
                        {...register('typeDeMission')}
                      />
                    </div>
                    {errors.typeDeMission && (
                      <p className="text-red-500 text-sm mt-2">{errors.typeDeMission.message}</p>
                    )}
                  </div>

                  {/* Compétence principale */}
                  <div>
                    <div className="relative categorie-dropdown">
                      <RiPsychotherapyLine className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                      <div
                        onClick={() => {
                          setIsCategorieDropdownOpen(!isCategorieDropdownOpen)
                          setIsMissionDropdownOpen(false)
                        }}
                        className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                          isCategorieDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                        } hover:bg-[#2A2A2A] hover:shadow-lg`}
                        style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                      >
                        <span className="block">
                          {watch('categoriePrincipaleId') 
                            ? (categories.find((c) => c.id === watch('categoriePrincipaleId'))?.nom) || t.form.category
                            : t.form.category}
                          {!watch('categoriePrincipaleId') && <span className="text-[#297BFF]">*</span>}
                        </span>
                        <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isCategorieDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {isCategorieDropdownOpen && (
                        <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl max-h-60 overflow-y-auto">
                          {isLoadingCategories ? (
                            <div className="px-4 py-3 text-white/60 text-center">{t.loading}</div>
                          ) : categories.length === 0 ? (
                            <div className="px-4 py-3 text-white/60 text-center">{t.messages.error}</div>
                          ) : (
                            categories.map((categorie) => (
                              <div key={categorie.id} className="px-4 py-2">
                                <div
                                  onClick={() => {
                                    setValue('categoriePrincipaleId', categorie.id)
                                    setIsCategorieDropdownOpen(false)
                                  }}
                                  className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                  style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
                                >
                                  {categorie.nom}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      
                      <input
                        type="hidden"
                        {...register('categoriePrincipaleId')}
                      />
                    </div>
                    {errors.categoriePrincipaleId && (
                      <p className="text-red-500 text-sm mt-2">{errors.categoriePrincipaleId.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="cv"
                      type="file"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                            aria-label={t.form.removeCv}
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
                        <span style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}>{t.form.cv}</span>
                      </label>
                    )}
                  </div>
                  {errors.cv && (
                    <p className="text-red-500 text-sm mt-2">{errors.cv.message as string}</p>
                  )}
                </div>
                </>
              )}

              {/* Navigation d'étapes sur mobile */}
              {isMobile && (
                <div className="flex items-center justify-between pt-2">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                      className="px-4 py-2 border border-[#297BFF] text-[#297BFF] text-sm rounded-none"
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px' }}
                    >
                      {t.form.previous}
                    </button>
                  ) : (
                    <span />
                  )}

                  {currentStep < totalSteps && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((step) => Math.min(totalSteps, step + 1))}
                      className="ml-auto px-4 py-2 bg-[#297BFF] text-white text-sm rounded-none"
                      style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px' }}
                    >
                      {t.form.next}
                    </button>
                  )}
                </div>
              )}

              {/* Bouton de soumission et OAuth : toujours visibles sur desktop, seulement à la dernière étape sur mobile */}
              {(!isMobile || currentStep === totalSteps) && (
                <>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sil-accent px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px', color: 'white' }}
                >
                  <span>{isSubmitting ? t.form.submitting : t.form.submit}</span>
                  
                </button>

                <p className="text-left mt-4" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px', color: '#999999' }}>
                  {lang === 'FR' ? (
                    <>En cliquant sur <span style={{ color: '#297BFF' }}>« {t.form.submit} »</span>, vous acceptez les conditions générales et la politique de confidentialité de Sil Talents Tech.</>
                  ) : (
                    <>By clicking <span style={{ color: '#297BFF' }}>« {t.form.submit} »</span>, you accept the terms and conditions and privacy policy of Sil Talents Tech.</>
                  )}
                </p>

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
                    title={lang === 'FR' ? "S'inscrire avec Google" : 'Sign up with Google'}
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
                    title={lang === 'FR' ? "S'inscrire avec Facebook" : 'Sign up with Facebook'}
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
                    title={lang === 'FR' ? "S'inscrire avec LinkedIn" : 'Sign up with LinkedIn'}
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <path
                        fill="#0A66C2"
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.065 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="text-center pt-4">
                  <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px', color: '#999999' }}>
                    {t.haveAccount}{' '}
                    <Link
                      href="/candidat/login"
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
                      {t.signIn}
                    </Link>
                  </p>
                </div>
                </>
              )}
              </form>
            </motion.div>
          </div>
      </section>
    </div>
  )
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sil-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-sil-accent mx-auto mb-4"></div>
          <p className="text-sil-light">{translations.FR.loading}</p>
        </div>
      </div>
    }>
      <RegistrationForm />
    </Suspense>
  )
}
