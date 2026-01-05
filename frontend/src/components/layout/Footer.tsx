'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

// Chemin vers l'image hero (dans public)
const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    cta: {
      title: 'Discutons de vos défis technologiques',
      description: 'Nos équipes sont à votre écoute pour répondre à vos enjeux en recrutement IT, cybersécurité, IA ou transformation digitale.',
      bookAppointment: 'Prendre Rendez-vous',
      contactUs: 'Nous Contacter',
    },
    contact: {
      callNow: 'Appelez maintenant :',
      email: 'Email :',
      expert: 'Experts en recrutement IT, cybersécurité et intelligence artificielle',
    },
    sections: {
      quickLinks: 'Lien rapide',
      services: 'Services',
      candidate: 'Candidat',
      support: 'Support',
    },
    links: {
      about: 'À propos',
      quickApplication: 'Candidature rapide',
      services: 'Services',
      resources: 'Ressources',
      login: 'Connexion',
      signup: 'Inscription',
      dashboard: 'Dashboard',
      uploadCv: 'Upload CV',
      faqs: 'Faqs',
      privacy: 'Confidentialité',
      terms: 'Conditions générales',
    },
    services: {
      cybersecurity: 'Cybersécurité',
      ai: 'Intelligence Artificielle',
      networks: 'Réseaux & Télécom',
      consulting: 'Conseil & Expertise IT',
    },
    copyright: '© 2026 SIL TALENTS TECH',
  },
  EN: {
    cta: {
      title: 'Let\'s discuss your technology challenges',
      description: 'Our teams are here to help you with your IT recruitment, cybersecurity, AI or digital transformation challenges.',
      bookAppointment: 'Book Appointment',
      contactUs: 'Contact Us',
    },
    contact: {
      callNow: 'Call now:',
      email: 'Email:',
      expert: 'Experts in IT recruitment, cybersecurity and artificial intelligence',
    },
    sections: {
      quickLinks: 'Quick Links',
      services: 'Services',
      candidate: 'Candidate',
      support: 'Support',
    },
    links: {
      about: 'About',
      quickApplication: 'Quick Application',
      services: 'Postuler',
      resources: 'Resources',
      login: 'Login',
      signup: 'Sign Up',
      dashboard: 'Dashboard',
      uploadCv: 'Upload CV',
      faqs: 'FAQs',
      privacy: 'Privacy',
      terms: 'Terms & Conditions',
    },
    services: {
      cybersecurity: 'Cybersecurity',
      ai: 'Artificial Intelligence',
      networks: 'Networks & Telecom',
      consulting: 'IT Consulting & Expertise',
    },
    copyright: '© 2026 SIL TALENTS TECH',
  },
}

export function Footer() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [gridColumns, setGridColumns] = useState('repeat(1, 1fr)')
  const [openSection, setOpenSection] = useState<string | null>(null)

  useEffect(() => {
    const updateGrid = () => {
      if (window.innerWidth >= 1024) {
        // Répartition déséquilibrée :
        // C1 (Informations) : 32% - la plus large
        // C2 (Lien rapide) : 17%
        // C3 (Services) : 17%
        // C4 (Candidat) : 17%
        // C5 (Support) : 12% - la plus étroite
        setGridColumns('3.2fr 1.7fr 1.7fr 1.7fr 1.2fr')
      } else if (window.innerWidth >= 768) {
        setGridColumns('repeat(2, 1fr)')
      } else {
        setGridColumns('repeat(1, 1fr)')
      }
    }

    updateGrid()
    window.addEventListener('resize', updateGrid)
    return () => window.removeEventListener('resize', updateGrid)
  }, [])

  return (
    <footer className="bg-[#1A1A1A] w-full overflow-x-hidden">
      {/* Mobile : Footer simplifié avec bg gris foncé et accordéon */}
      <div className="md:hidden">
        {/* Section CTA avec BG Photo en haut */}
        <section 
          className="relative overflow-hidden w-full"
          style={{
            backgroundImage: `url(${heroImagePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '300px',
          }}
        >
          {/* Overlay sombre */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
          />
          
          {/* Contenu */}
          <div className="relative z-10 h-full min-h-[300px] flex items-center justify-start px-6 py-10">
            <div className="w-full text-left">
              <h2
                className="mb-4 text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontSize: '28px',
                  lineHeight: '1.2',
                }}
              >
                {t.cta.title}
              </h2>
              <p
                className="mb-6 leading-relaxed"
                style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', color: '#999999' }}
              >
                {t.cta.description}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="bg-[#297BFF] text-white px-6 py-3 text-center hover:bg-[#1f63d6] transition-all duration-300"
                  style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                >
                  {t.cta.bookAppointment}
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border border-white text-white px-6 py-3 text-center flex items-center justify-center space-x-2 hover:bg-white/10 transition-all duration-300"
                  style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px' }}
                >
                  <Image
                    src="/assets/Images/hugeicons_whatsapp-business.svg"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <span>{t.cta.contactUs}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contenu principal du footer */}
        <div className="bg-[#1A1A1A] py-8 px-6">
          {/* Logo */}
          <div className="mb-6 flex justify-start">
            <Image
              src="/assets/Images/logo.png"
              alt="SIL TALENTS TECH Logo"
              width={150}
              height={100}
              className="object-contain"
            />
          </div>

        {/* Coordonnées */}
        <div className="mb-6 space-y-3">
          <p className="text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}>
            {t.contact.callNow}{' '}
            <a
              href="tel:+212655682404"
              className="text-white hover:text-[#297BFF] transition-colors"
              style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '16px' }}
            >
              +212 655 682 404
            </a>
          </p>
          <p className="text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}>
            {t.contact.email}{' '}
            <a
              href="mailto:Contact.dearaujo@sil-talents.ma"
              className="text-white hover:text-[#297BFF] transition-colors"
              style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '16px' }}
            >
              Contact.dearaujo@sil-talents.ma
            </a>
          </p>
          <p className="text-[#999999] leading-relaxed" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}>
            {t.contact.expert}
          </p>
        </div>

        {/* Sections avec accordéon - 1 section ouverte à la fois */}
        <div className="space-y-2 mb-6">
          {/* Section 1 : Lien rapide */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setOpenSection(openSection === 'liens' ? null : 'liens')}
              className="w-full flex items-center justify-between py-3 text-left"
            >
              <h3 className="text-white capitalize" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                {t.sections.quickLinks}
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  openSection === 'liens' ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'liens' && (
              <ul className="space-y-2 pb-3">
                <li>
                  <Link
                    href="/a-propos"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.links.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/candidature-rapide"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.links.quickApplication}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offres"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.links.services}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ressources"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.links.resources}
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Section 2 : Services */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setOpenSection(openSection === 'services' ? null : 'services')}
              className="w-full flex items-center justify-between py-3 text-left"
            >
              <h3 className="text-white capitalize" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                {t.sections.services}
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  openSection === 'services' ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'services' && (
              <ul className="space-y-2 pb-3">
                <li>
                  <Link
                    href="/services/cybersecurite"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.services.cybersecurity}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/intelligence-artificielle"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.services.ai}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/reseaux-telecom"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.services.networks}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/conseil-expertise-it"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.services.consulting}
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Section 3 : Candidat */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setOpenSection(openSection === 'candidat' ? null : 'candidat')}
              className="w-full flex items-center justify-between py-3 text-left"
            >
              <h3 className="text-white capitalize" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                {t.sections.candidate}
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  openSection === 'candidat' ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'candidat' && (
              <ul className="space-y-2 pb-3">
                <li>
                  <Link
                    href="/candidat/login"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.links.login}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/candidat/inscription"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.links.signup}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/candidat/dashboard"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.links.dashboard}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/candidat/upload-cv"
                    className="text-[#999999] hover:text-white transition-colors block"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {t.links.uploadCv}
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Copyright et réseaux sociaux */}
        <div className="pt-6 mt-6">
          <p className="text-center text-[#999999] mb-4" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}>
            {t.copyright}
          </p>
          <div className="flex justify-center items-center space-x-6">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#297BFF] transition-colors"
              aria-label="Facebook"
            >
              <Image
                src="/assets/Images/fb.svg"
                alt="Facebook"
                width={24}
                height={24}
                className="object-contain w-6 h-6"
              />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#297BFF] transition-colors"
              aria-label="Instagram"
            >
              <Image
                src="/assets/Images/instagram 1.svg"
                alt="Instagram"
                width={24}
                height={24}
                className="object-contain w-6 h-6"
              />
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#297BFF] transition-colors"
              aria-label="LinkedIn"
            >
              <Image
                src="/assets/Images/linkedin.svg"
                alt="LinkedIn"
                width={48}
                height={48}
                className="object-contain w-12 h-12"
              />
            </a>
          </div>
        </div>
        </div>
      </div>

      {/* Desktop : Footer original */}
      <div className="hidden md:block">
      {/* Section CTA avec BG Photo */}
      <section 
        className="relative overflow-hidden mt-[100px] w-[90%] max-w-[1200px] mx-auto"
        style={{
          backgroundImage: `url(${heroImagePath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '400px',
        }}
      >
        {/* Overlay sombre identique à la Hero section */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        ></div>
        
        {/* Contenu - responsive, centré sur mobile, aligné à gauche sur desktop */}
        <div className="relative z-10 h-full min-h-[400px] flex items-center justify-center md:justify-start px-6 py-10 md:px-12 lg:px-16">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[700px] md:max-w-[60%] text-left"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6 text-white"
              style={{
                fontFamily: 'Inter',
                fontWeight: 300,
                fontStyle: 'normal',
                // 28px sur mobile, 48px sur desktop via taille fluide
                fontSize: 'clamp(28px, 4vw, 48px)',
              }}
            >
              {t.cta.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 leading-relaxed max-w-[90%]"
              style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px', color: '#999999' }}
            >
              {t.cta.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              // Colonne sur mobile, ligne sur desktop
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              {/* Bouton Primaire */}
              <Link
                href="/contact"
                className="bg-[#297BFF] text-white px-8 py-4 hover:shadow-xl transition-all duration-300 whitespace-nowrap"
                style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px' }}
              >
                {t.cta.bookAppointment}
              </Link>
              
              {/* Bouton Secondaire */}
              <Link
                href="/contact"
                className="bg-transparent border border-white text-white px-8 py-4 flex items-center space-x-2 hover:shadow-xl hover:bg-white/10 transition-all duration-300 whitespace-nowrap"
                style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '18px' }}
              >
                <Image
                  src="/assets/Images/hugeicons_whatsapp-business.svg"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span>{t.cta.contactUs}</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Contenu principal du footer */}
      <div className="w-[90%] max-w-[1200px] mx-auto py-12 md:py-16">
        <div 
          className="grid gap-6 lg:gap-8"
          style={{ 
            gridTemplateColumns: gridColumns,
            alignItems: 'stretch',
          }}
        >
          {/* Bloc d'Informations (Gauche) */}
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="mb-4 flex-shrink-0">
              <Image
                src="/assets/Images/logo.png"
                alt="SIL TALENTS TECH Logo"
                width={180}
                height={120}
                className="object-contain"
              />
            </div>
            {/* Contenu aligné en bas */}
            <div className="flex flex-col justify-end flex-grow">
              {/* Coordonnées */}
              <div className="space-y-2 mb-3">
                <p className="text-[#7B7B7B] text-base leading-relaxed" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                {t.contact.callNow}{' '}
                  <a
                    href="tel:+212655682404"
                    className="underline hover:text-white transition-colors"
                    style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '18px', color: 'white' }}
                  >
                    +212 655 682 404
                  </a>
                </p>
                <p className="text-[#7B7B7B] text-base leading-relaxed" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                  {t.contact.email}{' '}
                  <a
                    href="mailto:Contact@sil-talents.ma"
                    className="no-underline hover:text-white transition-colors"
                    style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '18px', color: 'white' }}
                  >
                    Contact@sil-talents.ma
                  </a>
                </p>
              </div>
              
              {/* Description */}
              <p className="text-[#7B7B7B] text-sm leading-tight" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
              {t.contact.expert}
              </p>
            </div>
          </div>

          {/* Colonne : Lien rapide */}
          <div className="flex flex-col h-full">
            <h3 className="text-white mb-4 capitalize flex-shrink-0" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '20px', minHeight: '28px' }}>
              {t.sections.quickLinks}
            </h3>
            <ul className="space-y-2 flex-grow">
              <li className="min-h-[24px]">
                <Link
                  href="/a-propos"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.about}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/candidature-rapide"
                  className="hover:text-white transition-colors flex items-center space-x-1"
                  style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '18px', color: 'white' }}
                >
                  <ArrowRight className="w-3 h-3 text-white" />
                  <span>{t.links.quickApplication}</span>
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/offres"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  Postuler
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/ressources"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.resources}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne : Services */}
          <div className="flex flex-col h-full">
            <h3 className="text-white mb-4 capitalize flex-shrink-0" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '20px', minHeight: '28px' }}>
              {t.sections.services}
            </h3>
            <ul className="space-y-2 flex-grow">
              <li className="min-h-[24px]">
                <Link
                  href="/services/cybersecurite"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.services.cybersecurity}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/services/intelligence-artificielle"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.services.ai}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/services/reseaux-telecom"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.services.networks}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/services/conseil-expertise"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.services.consulting}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne : Candidat */}
          <div className="flex flex-col h-full">
            <h3 className="text-white mb-4 capitalize flex-shrink-0" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '20px', minHeight: '28px' }}>
              {t.sections.candidate}
            </h3>
            <ul className="space-y-2 flex-grow">
              <li className="min-h-[24px]">
                <Link
                  href="/candidat/login"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.login}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/candidat/inscription"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.signup}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/candidat/dashboard"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.dashboard}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/candidature-rapide"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.uploadCv}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne : Support */}
          <div className="flex flex-col h-full">
            <h3 className="text-white mb-4 capitalize flex-shrink-0" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '20px', minHeight: '28px' }}>
              {t.sections.support}
            </h3>
            <ul className="space-y-2 flex-grow">
              <li className="min-h-[24px]">
                <Link
                  href="/faqs"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.faqs}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/politique-confidentialite"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.privacy}
                </Link>
              </li>
              <li className="min-h-[24px]">
                <Link
                  href="/conditions-generales"
                  className="hover:text-white transition-colors whitespace-nowrap"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#7B7B7B' }}
                >
                  {t.links.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bande Inférieure (Copyright et Réseaux Sociaux) */}
      <div className="bg-[#1A1A1A] border-t border-[#3A3A3A]">
        <div className="w-[90%] max-w-[1200px] mx-auto py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-[#7B7B7B]" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}>
              {t.copyright}
            </p>

            {/* Réseaux Sociaux */}
            <div className="flex items-center space-x-6">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#D9D9D9] transition-colors"
                aria-label="Facebook"
              >
                <Image
                  src="/assets/Images/fb.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                  className="object-contain w-6 h-6"
                />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#D9D9D9] transition-colors"
                aria-label="Instagram"
              >
                <Image
                  src="/assets/Images/instagram 1.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="object-contain w-6 h-6"
                />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#D9D9D9] transition-colors"
                aria-label="LinkedIn"
              >
                <Image
                  src="/assets/Images/linkedin.svg"
                  alt="LinkedIn"
                  width={48}
                  height={48}
                  className="object-contain w-12 h-12"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  )
}