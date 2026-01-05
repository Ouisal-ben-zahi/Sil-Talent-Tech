'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MapPin, Send, User, Building2, FileText, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Contactez notre équipe',
    pageDescription: 'Une question, un besoin spécifique ou un projet de recrutement ? Remplissez le formulaire ci-dessous, nous reviendrons vers vous rapidement.',
    form: {
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      company: 'Entreprise',
      subject: 'Sujet',
      message: 'Message',
      submit: 'Envoyer le message',
      submitting: 'Envoi en cours...',
    },
    contact: {
      phone: 'Téléphone',
      email: 'Email',
      address: 'Adresse',
      addressValue: 'Marrakech, Maroc',
    },
    success: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    validation: {
      nameMin: 'Le nom doit contenir au moins 2 caractères',
      emailInvalid: 'Email invalide',
      subjectMin: 'Le sujet doit contenir au moins 5 caractères',
      messageMin: 'Le message doit contenir au moins 10 caractères',
    },
  },
  EN: {
    pageTitle: 'Contact our team',
    pageDescription: 'A question, a specific need or a recruitment project? Fill out the form below, we will get back to you quickly.',
    form: {
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      subject: 'Subject',
      message: 'Message',
      submit: 'Send message',
      submitting: 'Sending...',
    },
    contact: {
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      addressValue: 'Marrakech, Morocco',
    },
    success: 'Message sent successfully! We will get back to you as soon as possible.',
    error: 'An error occurred. Please try again.',
    validation: {
      nameMin: 'Name must contain at least 2 characters',
      emailInvalid: 'Invalid email',
      subjectMin: 'Subject must contain at least 5 characters',
      messageMin: 'Message must contain at least 10 characters',
    },
  },
}

export default function ContactPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  
  const contactSchema = z.object({
    name: z.string().min(2, t.validation.nameMin),
    email: z.string().email(t.validation.emailInvalid),
    phone: z.string().optional(),
    company: z.string().optional(),
    subject: z.string().min(5, t.validation.subjectMin),
    message: z.string().min(10, t.validation.messageMin),
  })

  type ContactFormData = z.infer<typeof contactSchema>

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const response = await api.post('/contact', data)
      toast.success(response.data.message || t.success)
      reset()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t.error
      toast.error(errorMessage)
      console.error('Erreur lors de l\'envoi du formulaire de contact:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-sil-dark relative">
      <section
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url(${heroImagePath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay sombre + gradient bas comme Connexion / Inscription */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />

        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto h-full min-h-screen flex flex-col justify-between py-12 md:py-20">
          {/* Titre en haut, comme les pages d'auth */}
          <div className="max-w-3xl text-left mb-10 md:mb-16 mt-20 md:mt-24">
            <h1
              className="mb-4 text-sil-white text-[28px] md:text-[40px] lg:text-[48px]"
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              {t.pageTitle}
            </h1>
            <p
              style={{
                fontFamily: 'Inter',
                fontWeight: 200,
                fontSize: '18px',
                color: '#999999',
              }}
            >
              {t.pageDescription}
            </p>
          </div>

          {/* Carte contact (formulaire + coordonnées) avec le même style que Connexion/Inscription */}
          <div className="bg-black/30 backdrop-blur-sm p-8 md:p-12 shadow-2xl max-w-5xl">
            <div className="space-y-8">
              {/* Formulaire de contact */}
              <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Nom complet (obligatoire) */}
                    <div>
                      <label htmlFor="name" className="sr-only">
                        {t.form.name}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                        <input
                          id="name"
                          type="text"
                          {...register('name')}
                          className="w-full bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none pl-12 pr-4 py-3 text-sil-white placeholder-transparent"
                          placeholder=" "
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                        />
                        {!watch('name') && (
                          <span
                            className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                          >
                            {t.form.name}<span className="text-[#297BFF]">*</span>
                          </span>
                        )}
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email (obligatoire) */}
                    <div>
                      <label htmlFor="email" className="sr-only">
                        {t.form.email}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                        <input
                          id="email"
                          type="email"
                          {...register('email')}
                          className="w-full bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none pl-12 pr-4 py-3 text-sil-white placeholder-transparent"
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
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Téléphone (optionnel) */}
                    <div>
                      <label htmlFor="phone" className="sr-only">
                        {t.form.phone}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                        <input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          className="w-full bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none pl-12 pr-4 py-3 text-sil-white placeholder-transparent"
                          placeholder=" "
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                        />
                        {!watch('phone') && (
                          <span
                            className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                          >
                            {t.form.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Entreprise (optionnel) */}
                    <div>
                      <label htmlFor="company" className="sr-only">
                        {t.form.company}
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                        <input
                          id="company"
                          type="text"
                          {...register('company')}
                          className="w-full bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none pl-12 pr-4 py-3 text-sil-white placeholder-transparent"
                          placeholder=" "
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                        />
                        {!watch('company') && (
                          <span
                            className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                          >
                            {t.form.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sujet (obligatoire) */}
                  <div>
                    <label htmlFor="subject" className="sr-only">
                      {t.form.subject}
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" />
                      <input
                        id="subject"
                        type="text"
                        {...register('subject')}
                        className="w-full bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none pl-12 pr-4 py-3 text-sil-white placeholder-transparent"
                        placeholder=" "
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                      />
                      {!watch('subject') && (
                        <span
                          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                        >
                          {t.form.subject}<span className="text-[#297BFF]">*</span>
                        </span>
                      )}
                    </div>
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  {/* Message (obligatoire) */}
                  <div>
                    <label htmlFor="message" className="sr-only">
                      {t.form.message}
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[#297BFF]" />
                      <textarea
                        id="message"
                        {...register('message')}
                        rows={6}
                        className="w-full bg-black/50 focus:outline-none focus:ring-2 focus:ring-sil-accent transition-all rounded-none pl-12 pr-4 py-3 text-sil-white placeholder-transparent resize-none"
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
                      <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-sil-accent px-8 py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 rounded-none text-white"
                    style={{ fontFamily: 'Inter', fontWeight: 200 }}
                  >
                    <span>{isSubmitting ? t.form.submitting : t.form.submit}</span>
                  </button>
                </form>
              </div>

              {/* Coordonnées en bas du formulaire */}
              <div className="border-t border-white/10 pt-6 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-sil-accent/10 flex items-center justify-center flex-shrink-0 rounded-none border border-white/10">
                    <Phone className="w-4 h-4 text-sil-accent" />
                  </div>
                  <div>
                    <p className="text-[#999999] mb-1" style={{ fontFamily: 'Inter' }}>{t.contact.phone}</p>
                    <a
                      href="tel:+212655682404"
                      className="text-sil-accent hover:underline"
                      style={{ fontFamily: 'Inter' }}
                    >
                      +212 655 682 404
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-sil-accent/10 flex items-center justify-center flex-shrink-0 rounded-none border border-white/10">
                    <Mail className="w-4 h-4 text-sil-accent" />
                  </div>
                  <div>
                    <p className="text-[#999999] mb-1" style={{ fontFamily: 'Inter' }}>{t.contact.email}</p>
                    <a
                      href="mailto:Contact@sil-talents.ma"
                      className="text-sil-accent hover:underline break-all"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Contact@sil-talents.ma
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-sil-accent/10 flex items-center justify-center flex-shrink-0 rounded-none border border-white/10">
                    <MapPin className="w-4 h-4 text-sil-accent" />
                  </div>
                  <div>
                    <p className="text-[#999999] mb-1" style={{ fontFamily: 'Inter' }}>{t.contact.address}</p>
                    <p className="text-[#D9D9D9]" style={{ fontFamily: 'Inter' }}>{t.contact.addressValue}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}













