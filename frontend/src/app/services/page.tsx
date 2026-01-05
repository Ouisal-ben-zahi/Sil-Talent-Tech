'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Nos Services',
    pageSubtitle: 'Quatre domaines d\'expertise pour répondre à tous vos besoins en recrutement technologique',
    discover: 'Voir plus',
    services: [
      {
        title: 'Cybersécurité',
        href: '/services/cybersecurite',
        description: 'Experts en sécurité informatique, conformité et protection des données.',
      },
      {
        title: 'Intelligence Artificielle',
        href: '/services/intelligence-artificielle',
        description: 'Talents en ML, Deep Learning, NLP et solutions IA sur mesure.',
      },
      {
        title: 'Réseaux & Télécom',
        href: '/services/reseaux-telecom',
        description: 'Spécialistes infrastructure, cloud, DevOps et télécommunications.',
      },
      {
        title: 'Conseil & Expertise IT',
        href: '/services/conseil-expertise',
        description: 'Architectes, consultants et experts pour transformer votre IT.',
      },
    ],
  },
  EN: {
    pageTitle: 'Our Services',
    pageSubtitle: 'Four areas of expertise to meet all your technology recruitment needs',
    discover: 'See more',
    services: [
      {
        title: 'Cybersecurity',
        href: '/services/cybersecurite',
        description: 'Experts in IT security, compliance and data protection.',
      },
      {
        title: 'Artificial Intelligence',
        href: '/services/intelligence-artificielle',
        description: 'Talents in ML, Deep Learning, NLP and custom AI solutions.',
      },
      {
        title: 'Networks & Telecom',
        href: '/services/reseaux-telecom',
        description: 'Infrastructure, cloud, DevOps and telecommunications specialists.',
      },
      {
        title: 'IT Consulting & Expertise',
        href: '/services/conseil-expertise',
        description: 'Architects, consultants and experts to transform your IT.',
      },
    ],
  },
}

export default function ServicesPage() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1A1A1A' }}>
      {/* Section Hero avec image de fond */}
      <section className="relative bg-black text-white overflow-hidden pt-0 min-h-screen md:min-h-0">
        {/* Background Image pleine largeur */}
        <div className="absolute inset-0 z-0 w-full h-full min-h-screen md:min-h-0">
          <Image
            src={heroImagePath}
            alt={t.pageTitle}
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
          />
        </div>

        {/* Contenu au-dessus de l'image */}
        <div className="relative z-10 mx-auto w-[90%] max-w-[1200px] min-h-screen md:min-h-0 flex flex-col justify-center pt-28 md:pt-32 pb-8 md:pb-12">
          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-2 md:mb-3 leading-tight"
            style={{
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: 'clamp(38px, 4vw, 56px)',
              color: '#FFFFFF',
              marginTop: '100px',
            }}
          >
            {t.pageTitle}
          </motion.h1>

          {/* Paragraphe d'introduction */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12 md:mb-16"
            style={{
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: 'clamp(14px, 2.4vw, 18px)',
              lineHeight: '28px',
              color: '#999999',
            }}
          >
            {t.pageSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Section Services */}
      <section className="section-padding" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto">
          {/* Cartes Services - Mobile: scroll horizontal */}
          <div
            className="md:hidden flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-4 pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {t.services.map((service, index) => {
              return (
                <motion.div
                  key={service.href}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="min-w-[85%] snap-center bg-[#0000006B] backdrop-blur-sm flex flex-col items-center text-center px-5 py-8 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                >
                  <div className="flex justify-center mb-8" style={{ minHeight: '40px', alignItems: 'center' }}>
                    <Image
                      src="/assets/Images/circle-wavy-check-duotone 1.svg"
                      alt="Expertise icon"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <h3
                    className="mb-3 text-white text-center"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontStyle: 'normal',
                      fontSize: '22px',
                      lineHeight: '140%',
                      minHeight: '56px',
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mb-10"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 200,
                      fontSize: '16px',
                      lineHeight: '26px',
                      color: '#999999',
                      minHeight: '96px',
                    }}
                  >
                    {service.description}
                  </p>
                  <Link
                    href={service.href}
                    className="inline-block hover:opacity-80 transition-opacity"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontStyle: 'normal',
                      fontSize: '17px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      textTransform: 'uppercase',
                      textDecoration: 'underline',
                      textDecorationStyle: 'solid',
                      textDecorationThickness: 'auto',
                      textUnderlineOffset: '4px',
                      color: '#297BFF',
                    }}
                  >
                    {t.discover}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Cartes Services - Desktop: grille */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {t.services.map((service, index) => {
              return (
                <motion.div
                  key={service.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="p-10 transition-all duration-300 flex flex-col bg-[#0000006B] backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:bg-[#00000080] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                >
                  <div className="flex justify-center mb-6" style={{ minHeight: '48px', alignItems: 'center' }}>
                    <Image
                      src="/assets/Images/circle-wavy-check-duotone 1.svg"
                      alt="Expertise icon"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <h3
                    className="mb-4 text-white text-left"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 500,
                      fontSize: '24px',
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mb-6 text-[#999999] text-left flex-grow"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 200,
                      fontSize: '18px',
                      lineHeight: '28px',
                    }}
                  >
                    {service.description}
                  </p>
                  <Link
                    href={service.href}
                    className="inline-block hover:opacity-80 transition-opacity mt-auto"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontStyle: 'normal',
                      fontSize: '17px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      textTransform: 'uppercase',
                      textDecoration: 'underline',
                      textDecorationStyle: 'solid',
                      textDecorationThickness: 'auto',
                      textUnderlineOffset: '4px',
                      color: '#297BFF',
                    }}
                  >
                    {t.discover}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}



