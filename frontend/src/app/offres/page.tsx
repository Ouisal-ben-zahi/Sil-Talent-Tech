'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Shield, Brain, Network, Briefcase } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Services & Postulation',
    pageDescription: 'Découvrez nos domaines d\'expertise et postulez pour rejoindre nos équipes. Nous recrutons les meilleurs talents pour accompagner nos clients dans leurs projets technologiques.',
    services: [
      {
        id: 'cybersecurite',
        title: 'Cybersécurité',
        description: 'Protection des systèmes, des réseaux et des données contre les cybermenaces, audits de sécurité et gestion des risques.',
      },
      {
        id: 'intelligence-artificielle',
        title: 'Intelligence Artificielle',
        description: 'Développement de solutions IA, automatisation, analyse de données et intégration de modèles intelligents.',
      },
      {
        id: 'reseaux-telecom',
        title: 'Réseaux & Télécom',
        description: 'Conception, déploiement et maintenance des infrastructures réseaux et télécoms pour les entreprises.',
      },
      {
        id: 'conseil-expertise',
        title: 'Conseil & Expertise IT',
        description: 'Accompagnement stratégique, audit IT et optimisation des systèmes d\'information.',
      },
    ],
    buttons: {
      apply: 'Postuler',
      loginToApply: 'Se connecter pour postuler',
      quickApply: 'Candidature rapide',
    },
  },
  EN: {
    pageTitle: 'Services & Application',
    pageDescription: 'Discover our areas of expertise and apply to join our teams. We recruit the best talent to support our clients in their technology projects.',
    services: [
      {
        id: 'cybersecurite',
        title: 'Cybersecurity',
        description: 'Protection of systems, networks and data against cyber threats, security audits and risk management.',
      },
      {
        id: 'intelligence-artificielle',
        title: 'Artificial Intelligence',
        description: 'Development of AI solutions, automation, data analysis and integration of intelligent models.',
      },
      {
        id: 'reseaux-telecom',
        title: 'Networks & Telecom',
        description: 'Design, deployment and maintenance of network and telecom infrastructures for businesses.',
      },
      {
        id: 'conseil-expertise',
        title: 'IT Consulting & Expertise',
        description: 'Strategic support, IT audit and optimization of information systems.',
      },
    ],
    buttons: {
      apply: 'Apply',
      loginToApply: 'Login to apply',
      quickApply: 'Quick application',
    },
  },
}

export default function ServicesPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const router = useRouter()
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(!!token)
  }, [])

  const handlePostuler = (serviceTitle: string) => {
    const encodedCategorie = encodeURIComponent(serviceTitle)
    const postulerUrl = `/postuler?categorieName=${encodedCategorie}`

    if (isLoggedIn) {
      router.push(postulerUrl)
    } else {
      const redirectParam = encodeURIComponent(postulerUrl)
      router.push(`/candidat/login?redirect=${redirectParam}`)
    }
  }

  const handleCandidatureRapide = (serviceTitle: string) => {
    const encodedCategorie = encodeURIComponent(serviceTitle)
    router.push(`/candidature-rapide?categorieName=${encodedCategorie}`)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1A1A1A' }}>
      {/* Première section avec image de fond et cartes en overlay */}
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
            {t.pageDescription}
          </motion.p>

          {/* Cartes Services - Mobile: scroll horizontal */}
          <div className="md:hidden flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-2 pb-2" style={{ scrollbarWidth: 'none' }}>
            {t.services.map((service, index) => {
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="min-w-[85%] min-h-[400px] snap-center bg-[#0000006B] backdrop-blur-sm p-8 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)] flex flex-col"
                  onMouseEnter={() => setHoveredService(service.id)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <h3
                    className="mb-3 text-white text-left flex-shrink-0"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontSize: '22px',
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mb-6 text-[#999999] text-left flex-grow"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 100,
                      fontSize: '16px',
                      lineHeight: '26px',
                    }}
                  >
                    {service.description}
                  </p>
                  <div className="flex flex-col gap-3 mt-auto">
                    <button
                      type="button"
                      onClick={() => handlePostuler(service.title)}
                      className="w-full px-5 py-2 bg-[#297BFF] hover:bg-[#1f63d6] transition-colors text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 200,
                        fontSize: '14px',
                      }}
                    >
                      {isLoggedIn ? t.buttons.apply : t.buttons.loginToApply}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCandidatureRapide(service.title)}
                      className="w-full px-5 py-2 border border-[#297BFF] bg-transparent text-[#297BFF] hover:text-white hover:bg-[#297BFF] transition-colors"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 200,
                        fontSize: '14px',
                        border : '1px solid #297BFF'
                      }}
                    >
                      {t.buttons.quickApply}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Cartes Services - Desktop: grille */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {t.services.map((service, index) => {
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-10 transition-all duration-300 flex flex-col bg-[#0000006B] backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:bg-[#00000080] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                  onMouseEnter={() => setHoveredService(service.id)}
                  onMouseLeave={() => setHoveredService(null)}
                >
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
                  <div className="flex flex-row gap-3 mt-auto">
                    <button
                      type="button"
                      onClick={() => handlePostuler(service.title)}
                      className="flex-1 px-6 py-2 bg-[#297BFF] hover:bg-[#1f63d6] transition-colors text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 200,
                        fontSize: '16px',
                      }}
                    >
                      {isLoggedIn ? t.buttons.apply : t.buttons.loginToApply}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCandidatureRapide(service.title)}
                      className="flex-1 px-6 py-2 border border-[#297BFF] bg-transparent text-[#297BFF] hover:text-white hover:bg-[#297BFF] transition-colors"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 200,
                        fontSize: '16px',
                      }}
                    >
                      {t.buttons.quickApply}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Gradient de transition vers la section grise */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
      </section>
    </div>
  )
}
