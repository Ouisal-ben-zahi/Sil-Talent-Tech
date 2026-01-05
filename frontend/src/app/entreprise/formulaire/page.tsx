'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, Building2, User, MessageSquare, Briefcase, Users, Calendar, MapPin, Send, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'
import Image from 'next/image'
import { motion } from 'framer-motion'

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Demande de Profil Entreprise',
    pageDescription: 'Remplissez ce formulaire pour demander un profil ou planifier un échange avec notre équipe. Nous vous répondrons dans les plus brefs délais.',
    form: {
      contactPerson: 'Personne de contact',
      email: 'Email professionnel',
      phone: 'Téléphone',
      company: 'Nom de l\'entreprise',
      companySize: 'Taille de l\'entreprise',
      sector: 'Secteur d\'activité',
      position: 'Poste recherché',
      location: 'Localisation',
      urgency: 'Urgence',
      message: 'Détails de votre demande',
      submit: 'Envoyer la demande',
      submitting: 'Envoi en cours...',
    },
    companySizes: {
      small: '1-10 employés',
      medium: '11-50 employés',
      large: '51-200 employés',
      enterprise: '200+ employés',
    },
    sectors: {
      tech: 'Technologie',
      finance: 'Finance',
      healthcare: 'Santé',
      retail: 'Commerce de détail',
      manufacturing: 'Industrie',
      consulting: 'Conseil',
      other: 'Autre',
    },
    urgencies: {
      low: 'Faible (plus de 1 mois)',
      medium: 'Moyenne (2-4 semaines)',
      high: 'Élevée (1-2 semaines)',
      urgent: 'Urgente (moins d\'une semaine)',
    },
    success: 'Demande envoyée avec succès ! Nous vous contacterons dans les plus brefs délais.',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    validation: {
      contactPersonMin: 'Le nom doit contenir au moins 2 caractères',
      emailInvalid: 'Email invalide',
      phoneInvalid: 'Numéro de téléphone invalide',
      companyMin: 'Le nom de l\'entreprise doit contenir au moins 2 caractères',
      messageMin: 'Le message doit contenir au moins 10 caractères',
    },
  },
  EN: {
    pageTitle: 'Company Profile Request',
    pageDescription: 'Fill out this form to request a profile or schedule a meeting with our team. We will get back to you as soon as possible.',
    form: {
      contactPerson: 'Contact person',
      email: 'Business email',
      phone: 'Phone',
      company: 'Company name',
      companySize: 'Company size',
      sector: 'Industry sector',
      position: 'Position sought',
      location: 'Location',
      urgency: 'Urgency',
      message: 'Details of your request',
      submit: 'Send request',
      submitting: 'Sending...',
    },
    companySizes: {
      small: '1-10 employees',
      medium: '11-50 employees',
      large: '51-200 employees',
      enterprise: '200+ employees',
    },
    sectors: {
      tech: 'Technology',
      finance: 'Finance',
      healthcare: 'Healthcare',
      retail: 'Retail',
      manufacturing: 'Manufacturing',
      consulting: 'Consulting',
      other: 'Other',
    },
    urgencies: {
      low: 'Low (more than 1 month)',
      medium: 'Medium (2-4 weeks)',
      high: 'High (1-2 weeks)',
      urgent: 'Urgent (less than a week)',
    },
    success: 'Request sent successfully! We will contact you as soon as possible.',
    error: 'An error occurred. Please try again.',
    validation: {
      contactPersonMin: 'Name must contain at least 2 characters',
      emailInvalid: 'Invalid email',
      phoneInvalid: 'Invalid phone number',
      companyMin: 'Company name must contain at least 2 characters',
      messageMin: 'Message must contain at least 10 characters',
    },
  },
}

export default function CompanyFormPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompanySizeDropdownOpen, setIsCompanySizeDropdownOpen] = useState(false)
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false)
  const [isUrgencyDropdownOpen, setIsUrgencyDropdownOpen] = useState(false)
  
  const companyFormSchema = z.object({
    contactPerson: z.string().min(2, t.validation.contactPersonMin),
    email: z.string().email(t.validation.emailInvalid),
    phone: z.string().min(8, t.validation.phoneInvalid),
    company: z.string().min(2, t.validation.companyMin),
    companySize: z.string().min(1, 'Veuillez sélectionner une taille d\'entreprise'),
    sector: z.string().min(1, 'Veuillez sélectionner un secteur'),
    position: z.string().optional(),
    location: z.string().optional(),
    urgency: z.string().min(1, 'Veuillez sélectionner une urgence'),
    message: z.string().min(10, t.validation.messageMin),
  })

  type CompanyFormData = z.infer<typeof companyFormSchema>
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
  })

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.company-size-dropdown')) {
        setIsCompanySizeDropdownOpen(false)
      }
      if (!target.closest('.sector-dropdown')) {
        setIsSectorDropdownOpen(false)
      }
      if (!target.closest('.urgency-dropdown')) {
        setIsUrgencyDropdownOpen(false)
      }
    }

    if (isCompanySizeDropdownOpen || isSectorDropdownOpen || isUrgencyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCompanySizeDropdownOpen, isSectorDropdownOpen, isUrgencyDropdownOpen])

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true)
    try {
      const response = await api.post('/entreprise/demande', data)
      
      if (response.data.success) {
        toast.success(t.success)
        reset()
        setIsCompanySizeDropdownOpen(false)
        setIsSectorDropdownOpen(false)
        setIsUrgencyDropdownOpen(false)
      } else {
        toast.error(t.error)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t.error
      toast.error(errorMessage)
      console.error('Erreur lors de l\'envoi de la demande:', error)
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
              {/* Personne de contact et Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                    <input
                      id="contactPerson"
                      type="text"
                      {...register('contactPerson')}
                      className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('contactPerson') && (
                      <span
                        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                      >
                        {t.form.contactPerson}<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.contactPerson && (
                    <p className="text-red-500 text-sm mt-2">{errors.contactPerson.message}</p>
                  )}
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
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
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
              </div>

              {/* Téléphone et Entreprise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                    <input
                      id="company"
                      type="text"
                      {...register('company')}
                      className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('company') && (
                      <span
                        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                      >
                        {t.form.company}<span className="text-[#297BFF]">*</span>
                      </span>
                    )}
                  </div>
                  {errors.company && (
                    <p className="text-red-500 text-sm mt-2">{errors.company.message}</p>
                  )}
                </div>
              </div>

              {/* Taille entreprise et Secteur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative company-size-dropdown">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                    <div
                      onClick={() => {
                        setIsCompanySizeDropdownOpen(!isCompanySizeDropdownOpen)
                        setIsSectorDropdownOpen(false)
                        setIsUrgencyDropdownOpen(false)
                      }}
                      className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                        isCompanySizeDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                      } hover:bg-[#2A2A2A] hover:shadow-lg`}
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('companySize') ? '#FFFFFF' : '#999999' }}
                    >
                      <span className="block">
                        {watch('companySize') === 'small' ? t.companySizes.small :
                         watch('companySize') === 'medium' ? t.companySizes.medium :
                         watch('companySize') === 'large' ? t.companySizes.large :
                         watch('companySize') === 'enterprise' ? t.companySizes.enterprise :
                         t.form.companySize}
                        {!watch('companySize') && <span className="text-[#297BFF]">*</span>}
                      </span>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isCompanySizeDropdownOpen ? 'rotate-180' : ''}`} />
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                    </div>
                    
                    {isCompanySizeDropdownOpen && (
                      <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                        <div className="px-4 py-2">
                          <div
                            onClick={() => {
                              setValue('companySize', 'small')
                              setIsCompanySizeDropdownOpen(false)
                            }}
                            className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                              watch('companySize') === 'small' ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                            }`}
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('companySize') === 'small' ? '#297BFF' : '#999999' }}
                          >
                            {t.companySizes.small}
                          </div>
                        </div>
                        <div className="px-4 py-2">
                          <div
                            onClick={() => {
                              setValue('companySize', 'medium')
                              setIsCompanySizeDropdownOpen(false)
                            }}
                            className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                              watch('companySize') === 'medium' ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                            }`}
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('companySize') === 'medium' ? '#297BFF' : '#999999' }}
                          >
                            {t.companySizes.medium}
                          </div>
                        </div>
                        <div className="px-4 py-2">
                          <div
                            onClick={() => {
                              setValue('companySize', 'large')
                              setIsCompanySizeDropdownOpen(false)
                            }}
                            className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                              watch('companySize') === 'large' ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                            }`}
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('companySize') === 'large' ? '#297BFF' : '#999999' }}
                          >
                            {t.companySizes.large}
                          </div>
                        </div>
                        <div className="px-4 py-2">
                          <div
                            onClick={() => {
                              setValue('companySize', 'enterprise')
                              setIsCompanySizeDropdownOpen(false)
                            }}
                            className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                              watch('companySize') === 'enterprise' ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                            }`}
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('companySize') === 'enterprise' ? '#297BFF' : '#999999' }}
                          >
                            {t.companySizes.enterprise}
                          </div>
                        </div>
                      </div>
                    )}
                    <input type="hidden" {...register('companySize')} />
                  </div>
                  {errors.companySize && (
                    <p className="text-red-500 text-sm mt-2">{errors.companySize.message}</p>
                  )}
                </div>

                <div>
                  <div className="relative sector-dropdown">
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                    <div
                      onClick={() => {
                        setIsSectorDropdownOpen(!isSectorDropdownOpen)
                        setIsCompanySizeDropdownOpen(false)
                        setIsUrgencyDropdownOpen(false)
                      }}
                      className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                        isSectorDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                      } hover:bg-[#2A2A2A] hover:shadow-lg`}
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('sector') ? '#FFFFFF' : '#999999' }}
                    >
                      <span className="block">
                        {watch('sector') === 'tech' ? t.sectors.tech :
                         watch('sector') === 'finance' ? t.sectors.finance :
                         watch('sector') === 'healthcare' ? t.sectors.healthcare :
                         watch('sector') === 'retail' ? t.sectors.retail :
                         watch('sector') === 'manufacturing' ? t.sectors.manufacturing :
                         watch('sector') === 'consulting' ? t.sectors.consulting :
                         watch('sector') === 'other' ? t.sectors.other :
                         t.form.sector}
                        {!watch('sector') && <span className="text-[#297BFF]">*</span>}
                      </span>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                    </div>
                    
                    {isSectorDropdownOpen && (
                      <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl max-h-[300px] overflow-y-auto">
                        {Object.entries(t.sectors).map(([key, label]) => (
                          <div key={key} className="px-4 py-2">
                            <div
                              onClick={() => {
                                setValue('sector', key)
                                setIsSectorDropdownOpen(false)
                              }}
                              className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                                watch('sector') === key ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                              }`}
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('sector') === key ? '#297BFF' : '#999999' }}
                            >
                              {label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <input type="hidden" {...register('sector')} />
                  </div>
                  {errors.sector && (
                    <p className="text-red-500 text-sm mt-2">{errors.sector.message}</p>
                  )}
                </div>
              </div>

              {/* Poste recherché et Localisation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                    <input
                      id="position"
                      type="text"
                      {...register('position')}
                      className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('position') && (
                      <span
                        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                      >
                        {t.form.position}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                    <input
                      id="location"
                      type="text"
                      {...register('location')}
                      className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent"
                      placeholder=" "
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                    />
                    {!watch('location') && (
                      <span
                        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                      >
                        {t.form.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Urgence */}
              <div>
                <div className="relative urgency-dropdown">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                  <div
                    onClick={() => {
                      setIsUrgencyDropdownOpen(!isUrgencyDropdownOpen)
                      setIsCompanySizeDropdownOpen(false)
                      setIsSectorDropdownOpen(false)
                    }}
                    className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                      isUrgencyDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                    } hover:bg-[#2A2A2A] hover:shadow-lg`}
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('urgency') ? '#FFFFFF' : '#999999' }}
                  >
                    <span className="block">
                      {watch('urgency') === 'low' ? t.urgencies.low :
                       watch('urgency') === 'medium' ? t.urgencies.medium :
                       watch('urgency') === 'high' ? t.urgencies.high :
                       watch('urgency') === 'urgent' ? t.urgencies.urgent :
                       t.form.urgency}
                      {!watch('urgency') && <span className="text-[#297BFF]">*</span>}
                    </span>
                    <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isUrgencyDropdownOpen ? 'rotate-180' : ''}`} />
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                  </div>
                  
                  {isUrgencyDropdownOpen && (
                    <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                      {Object.entries(t.urgencies).map(([key, label]) => (
                        <div key={key} className="px-4 py-2">
                          <div
                            onClick={() => {
                              setValue('urgency', key)
                              setIsUrgencyDropdownOpen(false)
                            }}
                            className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                              watch('urgency') === key ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                            }`}
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: watch('urgency') === key ? '#297BFF' : '#999999' }}
                          >
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="hidden" {...register('urgency')} />
                </div>
                {errors.urgency && (
                  <p className="text-red-500 text-sm mt-2">{errors.urgency.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[#297BFF]" />
                  <textarea
                    id="message"
                    {...register('message')}
                    rows={6}
                    className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none placeholder-transparent resize-none"
                    placeholder=" "
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                  />
                  {!watch('message') && (
                    <span
                      className="pointer-events-none absolute left-12 top-4 text-[#999999]"
                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                    >
                      {t.form.message}<span className="text-[#297BFF]">*</span>
                    </span>
                  )}
                </div>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-2">{errors.message.message}</p>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sil-accent px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 rounded-none"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 200,
                    fontSize: '18px',
                    color: 'white'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      {t.form.submitting}
                    </>
                  ) : (
                    <>
                      
                      {t.form.submit}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
