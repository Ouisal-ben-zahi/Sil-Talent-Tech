'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Shield, Brain, Network, Briefcase } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const translations = {
  FR: {
    title: 'Nos expertises au service de votre performance digitale',
    paragraph: 'SIL TALENTS TECH vous propose une offre complète, combinant recrutement IT, cybersécurité, intelligence artificielle, services numériques et accompagnement managérial. Nous intervenons avec précision et agilité pour accélérer vos projets stratégiques.',
    button: 'Voir plus',
    services: [
  {
    title: 'Agence de recrutement IT',
    description: 'Accélérez vos recrutements avec des profils techniques préqualifiés. Placements en CDI, freelance ou mission.',
    href: '/services/cybersecurite',
  },
  {
    title: 'Coaching en management',
        description: "Accompagnement des leaders IT & tech pour piloter l'innovation, gérer la croissance numérique.",
    href: '/services/intelligence-artificielle',
  },
  {
    title: 'Intelligence Artificielle',
    description: 'Conseil en stratégie IA, développement de modèles sur mesure, intégration et automatisation intelligente.',
    href: '/services/reseaux-telecom',
  },
  {
    title: 'Cybersécurité',
    description: 'Audit, conformité RGPD/ISO, pentesting, SOC externalisé et réponse à incident 24/7.',
    href: '/services/conseil-expertise',
  },
    ],
  },
  EN: {
    title: 'Our expertise at the service of your digital performance',
    paragraph: 'SIL TALENTS TECH offers you a complete solution, combining IT recruitment, cybersecurity, artificial intelligence, digital services, and management support. We act with precision and agility to accelerate your strategic projects.',
    button: 'See more',
    services: [
      {
        title: 'IT Recruitment Agency',
        description: 'Accelerate your recruitment with pre-qualified technical profiles. Placements in permanent contracts, freelance, or project-based.',
        href: '/services/cybersecurite',
      },
      {
        title: 'Management Coaching',
        description: 'Support for IT & tech leaders to drive innovation and manage digital growth.',
        href: '/services/intelligence-artificielle',
      },
      {
        title: 'Artificial Intelligence',
        description: 'AI strategy consulting, custom model development, integration, and intelligent automation.',
        href: '/services/reseaux-telecom',
      },
      {
        title: 'Cybersecurity',
        description: 'Audit, GDPR/ISO compliance, pentesting, outsourced SOC, and 24/7 incident response.',
        href: '/services/conseil-expertise',
      },
    ],
  },
}

export function ServicesPreview() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <section className="section-padding" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="w-[90%] max-w-[1200px] mx-auto">
        <div className="mb-16 max-w-[80%] max-md:max-w-full">
          <h2 
            className="mb-6"
            style={{ 
              fontFamily: 'Inter', 
              fontWeight: 200, 
              fontStyle: 'Light',
              // Taille fluide : plus petite sur mobile, 48px sur desktop
              fontSize: 'clamp(28px, 5vw, 48px)',
              color: '#FFFFFF'
            }}
          >
            {t.title}
          </h2>
          <p 
            style={{ 
              fontFamily: 'Inter', 
              fontWeight: 200, 
              fontStyle: 'Extra Light',
              fontSize: '18px',
              color: '#999999'
            }}
          >
            {t.paragraph}
          </p>
        </div>

        {/* Cartes - mobile : scroll horizontal avec scroll snap */}
        <div
          className="md:hidden flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-4 pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {t.services.map((service) => {
            return (
              <div
                key={service.href}
                className="min-w-[85%] snap-center bg-[#0000006B] flex flex-col items-start text-left px-5 py-8 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
              >
                <div className="flex justify-start mb-8" style={{ minHeight: '40px', alignItems: 'center' }}>
                  <Image
                    src="/assets/Images/circle-wavy-check-duotone 1.svg"
                    alt="Expertise icon"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h3
                  className="mb-3 text-white text-left"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 300,
                    fontStyle: 'normal',
                    fontSize: '22px',
                    lineHeight: '140%',
                    minHeight: '56px', // même hauteur de bloc pour aligner les titres
                  }}
                >
                  {service.title}
                </h3>
                <p
                  className="mb-10 text-left"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 200,
                    fontSize: '16px',
                    lineHeight: '26px',
                    color: '#999999',
                    minHeight: '96px', // même hauteur de paragraphe pour aligner les CTA
                  }}
                >
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="inline-block hover:opacity-80 transition-opacity text-left"
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
                  {t.button}
                </Link>
              </div>
            )
          })}
        </div>


        {/* Cartes - desktop : grille classique */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {t.services.map((service) => {
            return (
              <div
                key={service.href}
                className="py-8 px-5 transition-all duration-300 flex flex-col items-center text-center bg-[#0000006B] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:bg-[#00000080] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
              >
                <div className="flex justify-center mb-10" style={{ minHeight: '48px', alignItems: 'center' }}>
                  <Image
                    src="/assets/Images/circle-wavy-check-duotone 1.svg"
                    alt="Expertise icon"
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>
                <h3
                  className="mb-4 text-white text-center"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 300,
                    fontStyle: 'normal',
                    fontSize: '22px',
                    lineHeight: '140%',
                    minHeight: '64px', // bloc titre aligné sur toutes les cartes desktop
                  }}
                >
                  {service.title}
                </h3>
                <p
                  className="mb-10 flex-grow"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 200,
                    fontSize: '18px',
                    color: '#999999',
                    minHeight: '110px', // même hauteur de paragraphe desktop
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
                  {t.button}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}



