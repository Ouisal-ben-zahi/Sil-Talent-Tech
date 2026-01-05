'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, FileText, X, User, Mail, Phone, Linkedin, Globe, Briefcase, MapPin, ChevronDown, ClipboardList, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

// Chemin vers l'image hero
const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Formulaire de candidature',
    pageDescription: 'Complétez votre candidature pour postuler à nos offres',
    loading: 'Chargement...',
    steps: {
      step: 'Étape',
      of: 'sur',
      step1: 'Renseignez vos informations personnelles.',
      step2: 'Ajoutez vos liens professionnels et votre niveau d\'expertise.',
      step3: 'Sélectionnez la catégorie, le type de mission et téléchargez votre CV.',
    },
    form: {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
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
      category: 'Catégorie',
      missionType: 'Type de mission',
      cv: 'Cliquez pour télécharger votre CV',
      cvCurrent: 'CV actuel (vous pouvez le remplacer)',
      removeCv: 'Retirer le CV',
      previous: 'Précédent',
      next: 'Suivant',
      submit: 'Envoyer ma candidature',
      submitting: 'Envoi en cours...',
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
      linkedinInvalid: 'URL LinkedIn invalide',
      portfolioInvalid: 'URL invalide',
      categoryRequired: 'Veuillez sélectionner une catégorie',
      cvPdf: 'Le fichier doit être un PDF',
      cvSize: 'Le fichier ne doit pas dépasser 10 Mo',
      cvRequired: 'Veuillez télécharger un CV',
    },
    messages: {
      loginRequired: 'Veuillez vous connecter ou créer un compte pour postuler',
      success: 'Votre candidature a été envoyée avec succès !',
      error: 'Une erreur est survenue. Veuillez réessayer.',
      cvUploadError: 'Erreur lors de l\'upload du CV',
      noCategory: 'Aucune catégorie disponible. Veuillez contacter l\'administrateur.',
      categoryError: 'Erreur lors du chargement des catégories',
    },
  },
  EN: {
    pageTitle: 'Application form',
    pageDescription: 'Complete your application to apply for our offers',
    loading: 'Loading...',
    steps: {
      step: 'Step',
      of: 'of',
      step1: 'Enter your personal information.',
      step2: 'Add your professional links and expertise level.',
      step3: 'Select the category, mission type and upload your CV.',
    },
    form: {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
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
      category: 'Category',
      missionType: 'Mission type',
      cv: 'Click to upload your CV',
      cvCurrent: 'Current CV (you can replace it)',
      removeCv: 'Remove CV',
      previous: 'Previous',
      next: 'Next',
      submit: 'Submit my application',
      submitting: 'Submitting...',
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
      linkedinInvalid: 'Invalid LinkedIn URL',
      portfolioInvalid: 'Invalid URL',
      categoryRequired: 'Please select a category',
      cvPdf: 'File must be a PDF',
      cvSize: 'File must not exceed 10 MB',
      cvRequired: 'Please upload a CV',
    },
    messages: {
      loginRequired: 'Please login or create an account to apply',
      success: 'Your application has been sent successfully!',
      error: 'An error occurred. Please try again.',
      cvUploadError: 'Error uploading CV',
      noCategory: 'No category available. Please contact the administrator.',
      categoryError: 'Error loading categories',
    },
  },
}

interface Categorie {
  id: string
  nom: string
  description: string | null
}

type ApplicationFormData = z.infer<ReturnType<typeof createApplicationSchema>>

function createApplicationSchema(t: typeof translations.FR) {
  return z.object({
    firstName: z.string().min(2, t.validation.firstNameMin),
    lastName: z.string().min(2, t.validation.lastNameMin),
    email: z.string().email(t.validation.emailInvalid),
    phone: z.string().min(10, t.validation.phoneRequired),
    linkedin: z.string().url(t.validation.linkedinInvalid).optional().or(z.literal('')),
    portfolio: z.string().url(t.validation.portfolioInvalid).optional().or(z.literal('')),
    jobTitle: z.string().optional(),
    expertiseLevel: z.enum(['junior', 'confirme', 'senior', 'expert']).optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    categorieId: z.string().min(1, t.validation.categoryRequired),
    typeDeMission: z.enum(['CDI', 'CDD', 'stage', 'freelance', 'autre']).optional(),
    cv: z.any().optional()
      .refine((files) => {
        if (!files || files.length === 0) return true
        if (typeof FileList !== 'undefined' && files instanceof FileList) {
          return files[0]?.type === 'application/pdf'
        }
        // Fallback for other file input types
        return true
      }, t.validation.cvPdf)
      .refine((files) => {
        if (!files || files.length === 0) return true
        if (typeof FileList !== 'undefined' && files instanceof FileList) {
          return files[0]?.size <= 10 * 1024 * 1024 // 10MB
        }
        return true
      }, t.validation.cvSize),
  })
}

function ApplicationForm() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const applicationSchema = createApplicationSchema(t)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cvFileName, setCvFileName] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMissionDropdownOpen, setIsMissionDropdownOpen] = useState(false)
  const [isCategorieDropdownOpen, setIsCategorieDropdownOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [isMobile, setIsMobile] = useState(false)
  const [categories, setCategories] = useState<Categorie[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentCv, setCurrentCv] = useState<{ fileName: string; filePath: string } | null>(null)
  const categorieNameFromUrl = searchParams.get('categorieName')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  })
  
  const missionTypes = [
    { value: 'CDI', label: t.missionTypes.CDI },
    { value: 'CDD', label: t.missionTypes.CDD },
    { value: 'stage', label: t.missionTypes.stage },
    { value: 'freelance', label: t.missionTypes.freelance },
    { value: 'autre', label: t.missionTypes.autre },
  ]

  // Vérifier l'authentification et charger le profil si connecté
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    
    if (!token) {
      // Utilisateur non connecté : afficher le formulaire vide
      setIsLoggedIn(false)
      setIsLoadingProfile(false)
      return
    }

    // Utilisateur connecté : charger le profil et le CV
    setIsLoggedIn(true)
    const fetchProfile = async () => {
      try {
        const [profileResponse, cvHistoryResponse] = await Promise.all([
          api.get('/candidates/profile'),
          api.get('/candidates/cv-history').catch(() => null) // Ne pas bloquer si l'endpoint échoue
        ])
        
        const profileData = profileResponse.data.data || profileResponse.data
        setProfile(profileData)
        
        // Pré-remplir le formulaire avec les données du profil
        setValue('firstName', profileData.firstName || '')
        setValue('lastName', profileData.lastName || '')
        setValue('email', profileData.email || '')
        setValue('phone', profileData.phone || '')
        setValue('linkedin', profileData.linkedin || '')
        setValue('portfolio', profileData.portfolio || '')
        setValue('jobTitle', profileData.jobTitle || '')
        setValue('expertiseLevel', profileData.expertiseLevel || undefined)
        setValue('country', profileData.country || '')
        setValue('city', profileData.city || '')

        // Récupérer le CV le plus récent
        if (cvHistoryResponse && cvHistoryResponse.data) {
          const cvHistoryData = cvHistoryResponse.data.data || cvHistoryResponse.data
          const cvHistories = Array.isArray(cvHistoryData) ? cvHistoryData : []
          
          if (cvHistories.length > 0) {
            // Trier par date de téléchargement (le plus récent en premier)
            const sortedCvs = cvHistories.sort((a: any, b: any) => {
              const dateA = new Date(a.uploadedAt || a.uploaded_at || 0).getTime()
              const dateB = new Date(b.uploadedAt || b.uploaded_at || 0).getTime()
              return dateB - dateA
            })
            
            const latestCv = sortedCvs[0]
            setCurrentCv({
              fileName: latestCv.fileName || latestCv.file_name || 'CV actuel',
              filePath: latestCv.filePath || latestCv.file_path || ''
            })
            setCvFileName(latestCv.fileName || latestCv.file_name || 'CV actuel')
          }
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token invalide : considérer comme non connecté
          setIsLoggedIn(false)
          localStorage.removeItem('accessToken')
        } else {
          console.error('Erreur lors du chargement du profil:', error)
          // Continuer avec le formulaire vide en cas d'erreur
        }
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [router, setValue])

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
          toast.error(t.messages.noCategory)
        } else {
          console.log('✅ Catégories chargées avec succès:', categoriesData.map((c: any) => c.nom || c.name))
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
        
        let errorMessage = t.messages.categoryError
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast.error(errorMessage)
        setCategories([]) // Initialiser avec un tableau vide en cas d'erreur
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Pré-remplir la catégorie si un nom est passé dans l'URL
  useEffect(() => {
    if (!categorieNameFromUrl || !categories.length) return

    const normalizedFromUrl = categorieNameFromUrl.toLowerCase()
    const matchedCategorie = categories.find(
      (c) => c.nom?.toLowerCase() === normalizedFromUrl
    )

    if (matchedCategorie) {
      setValue('categorieId', matchedCategorie.id)
    }
  }, [categorieNameFromUrl, categories, setValue])

  // Détecter le mode mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.expertise-dropdown') && !target.closest('.mission-dropdown') && !target.closest('.categorie-dropdown')) {
        setIsDropdownOpen(false)
        setIsMissionDropdownOpen(false)
        setIsCategorieDropdownOpen(false)
      }
    }

    if (isDropdownOpen || isMissionDropdownOpen || isCategorieDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, isMissionDropdownOpen, isCategorieDropdownOpen])

  const cvFile = watch('cv')
  const selectedCategorie = watch('categorieId')
  const selectedMissionType = watch('typeDeMission')

  const handleRemoveCv = () => {
    setValue('cv', undefined as any)
    setCvFileName('')
    setCurrentCv(null)
    const fileInput = document.getElementById('cv') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        // Utilisateur non connecté : rediriger vers la page de choix
        toast(t.messages.loginRequired)
        router.push('/candidat/login')
        return
      }

      // Vérifier qu'un CV est disponible (nouveau ou existant)
      if (!data.cv || data.cv.length === 0) {
        if (!currentCv || !currentCv.filePath) {
          toast.error(t.validation.cvRequired)
          setIsSubmitting(false)
          return
        }
      }

      // 1. Mettre à jour le profil si nécessaire
      try {
        await api.put('/candidates/profile', {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          linkedin: data.linkedin,
          portfolio: data.portfolio,
          jobTitle: data.jobTitle,
          expertiseLevel: data.expertiseLevel,
          country: data.country,
          city: data.city,
        })
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        // Continuer même si la mise à jour du profil échoue
      }

      // 2. Uploader le CV ou utiliser le CV existant
      let cvPath = ''
      
      // Si un nouveau CV est sélectionné, l'uploader
      if (data.cv && data.cv[0]) {
        const formData = new FormData()
        formData.append('cv', data.cv[0])

        try {
          const cvResponse = await api.post('/candidates/cv', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          // Le backend retourne { success: true, cvHistory: { filePath, ... } }
          const responseData = cvResponse.data.data || cvResponse.data
          cvPath = responseData?.cvHistory?.filePath || responseData?.filePath || ''
          
          if (!cvPath) {
            throw new Error('Chemin du CV non retourné par le serveur')
          }
        } catch (error: any) {
          console.error('Erreur lors de l\'upload du CV:', error)
          const errorMessage = error.response?.data?.message || error.response?.data?.error || t.messages.cvUploadError
          toast.error(errorMessage)
          setIsSubmitting(false)
          return
        }
      } else if (currentCv && currentCv.filePath) {
        // Utiliser le CV existant
        cvPath = currentCv.filePath
      } else {
        // Aucun CV disponible
        toast.error(t.validation.cvRequired)
        setIsSubmitting(false)
        return
      }

      // 3. Créer la candidature
      const candidatureData = {
        categorieId: data.categorieId,
        cvPath: cvPath,
        typeDeMission: data.typeDeMission || undefined,
      }

      await api.post('/candidatures', candidatureData)

      toast.success(t.messages.success)
      setTimeout(() => {
        router.push('/candidat/dashboard')
      }, 1500)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || t.messages.error
      toast.error(errorMessage)
      console.error('Erreur lors de l\'envoi de la candidature:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCategories) {
    return (
      <div className="min-h-screen bg-sil-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-sil-accent mx-auto mb-4"></div>
          <p className="text-sil-light">{t.loading}</p>
        </div>
      </div>
    )
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
            className="text-left"
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Indicateur d'étapes sur mobile */}
              {isMobile && (
                <div className="mb-4">
                  <p
                    style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px', color: '#D9D9D9' }}
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

              {/* ÉTAPE 1 : Infos personnelles */}
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
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                      />
                      {!watch('firstName') && (
                        <span
                          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
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
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                      />
                      {!watch('lastName') && (
                        <span
                          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
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
                      readOnly={isLoggedIn}
                      style={{ 
                        fontFamily: 'Inter', 
                        fontWeight: 400, 
                        fontSize: '16px', 
                        color: isLoggedIn ? '#666666' : '#999999', 
                        cursor: isLoggedIn ? 'not-allowed' : 'text' 
                      }}
                    />
                    {!watch('email') && (
                      <span
                        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
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
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('phone') && (
                      <span
                        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                      >
                        {t.form.phone}<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-2">{errors.phone.message}</p>
                  )}
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
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
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
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
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
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative expertise-dropdown">
                      <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                          isDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]'
                        } hover:bg-[#2A2A2A] hover:shadow-lg`}
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                      >
                        <ClipboardList className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                        <span className="block">
                          {watch('expertiseLevel') === 'junior' ? t.form.expertiseLevels.junior :
                           watch('expertiseLevel') === 'confirme' ? t.form.expertiseLevels.confirme :
                           watch('expertiseLevel') === 'senior' ? t.form.expertiseLevels.senior :
                           watch('expertiseLevel') === 'expert' ? t.form.expertiseLevels.expert :
                           t.form.expertiseLevel}
                        </span>
                        <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                      </div>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                          <div className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('expertiseLevel', 'junior')
                                setIsDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
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
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
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
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
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
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                            >
                              {t.form.expertiseLevels.expert}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <input
                        type="hidden"
                        {...register('expertiseLevel')}
                      />
                    </div>
                  </div>
                </div>
                </>
              )}

              {/* ÉTAPE 3 : Localisation, Catégorie, Type de mission & CV */}
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
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
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
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sélection de la catégorie */}
                <div>
                  <div className="relative categorie-dropdown">
                    <div
                      onClick={() => setIsCategorieDropdownOpen(!isCategorieDropdownOpen)}
                      className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                        isCategorieDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]'
                      } hover:bg-[#2A2A2A] hover:shadow-lg`}
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    >
                      <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                      <span className="block">
                        {selectedCategorie ? categories.find(c => c.id === selectedCategorie)?.nom : t.form.category}
                        {!selectedCategorie && <span className="text-[#297BFF]">*</span>}
                      </span>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isCategorieDropdownOpen ? 'rotate-180' : ''}`} />
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                    </div>
                    
                    {isCategorieDropdownOpen && (
                      <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                        {categories.map((categorie) => (
                          <div key={categorie.id} className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('categorieId', categorie.id)
                                setIsCategorieDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                            >
                              {categorie.nom}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <input
                      type="hidden"
                      {...register('categorieId')}
                    />
                  </div>
                  {errors.categorieId && (
                    <p className="text-red-500 text-sm mt-2">{errors.categorieId.message}</p>
                  )}
                </div>

                {/* Sélection du type de mission */}
                <div>
                  <div className="relative mission-dropdown">
                    <div
                      onClick={() => setIsMissionDropdownOpen(!isMissionDropdownOpen)}
                      className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                        isMissionDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]'
                      } hover:bg-[#2A2A2A] hover:shadow-lg`}
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    >
                      <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                      <span className="block">
                        {selectedMissionType ? missionTypes.find(m => m.value === selectedMissionType)?.label : t.form.missionType}
                      </span>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isMissionDropdownOpen ? 'rotate-180' : ''}`} />
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                    </div>
                    
                    {isMissionDropdownOpen && (
                      <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                        {missionTypes.map((mission) => (
                          <div key={mission.value} className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('typeDeMission', mission.value as any)
                                setIsMissionDropdownOpen(false)
                              }}
                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                            >
                              {mission.label}
                            </div>
                          </div>
                        ))}
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

                <div>
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
                            setCurrentCv(null) // Réinitialiser le CV actuel si un nouveau fichier est sélectionné
                          }
                        },
                      })}
                      className="hidden"
                    />
                    {cvFileName || currentCv ? (
                      <div className="border-2 border-sil-accent rounded-lg p-4 bg-black/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <FileText className="w-6 h-6 text-sil-accent flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[#D9D9D9] font-medium truncate">
                                {cvFileName || currentCv?.fileName}
                              </span>
                              {currentCv && !cvFileName && (
                                <span className="text-xs text-[#999999] mt-1">{t.form.cvCurrent}</span>
                              )}
                            </div>
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
                        <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}>{t.form.cv}<span className="text-[#297BFF]">*</span></span>
                      </label>
                    )}
                  </div>
                  {errors.cv && (
                    <p className="text-red-500 text-sm mt-2">{String(errors.cv.message || '')}</p>
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

              {/* Bouton de soumission */}
              {(!isMobile || currentStep === totalSteps) && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sil-accent px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px', color: 'white' }}
                >
                  <span>{isSubmitting ? t.form.submitting : t.form.submit}</span>
                </button>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default function PostulerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sil-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-sil-accent mx-auto mb-4"></div>
          <p className="text-sil-light">{translations.FR.loading}</p>
        </div>
      </div>
    }>
      <ApplicationForm />
    </Suspense>
  )
}

