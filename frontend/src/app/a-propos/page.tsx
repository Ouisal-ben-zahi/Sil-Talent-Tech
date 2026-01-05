'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Target, Users, Award, Heart, Shield, Brain, Network, Briefcase, TrendingUp, Globe, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import LuminousCircle from '@/components/ui/LuminousCircle'

// Lazy load les blobs de lumière - Chargés seulement quand visibles
const LightBlobs = dynamic(() => import('@/components/ui/LightBlobs').then(mod => mod.LightBlobs), { 
  ssr: false,
  loading: () => null // Pas de loading pour les blobs (invisible)
})

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'À propos de Sil Talents Tech',
    altImage: 'À propos de Sil Talents Tech',
    introParagraph: 'Un cabinet de recrutement spécialisé qui transforme la façon dont les entreprises trouvent leurs talents technologiques. Nous allions expertise technique et approche humaine pour construire des équipes performantes.',
    expertiseTitle: 'Nos Domaines d\'Expertise',
    whyChooseTitle: 'Pourquoi Nous Choisir',
    values: [
  {
    icon: Target,
    title: 'Excellence',
    description: 'Nous visons l\'excellence dans chaque recrutement, en garantissant la meilleure adéquation entre talents et entreprises.',
  },
  {
    icon: Users,
    title: 'Proximité',
    description: 'Un accompagnement personnalisé et humain, avec un suivi continu tout au long du processus de recrutement.',
  },
  {
    icon: Award,
    title: 'Expertise',
    description: 'Une connaissance approfondie des métiers tech et des enjeux du marché pour un conseil avisé et stratégique.',
  },
  {
    icon: Heart,
    title: 'Engagement',
    description: 'Un engagement fort envers nos clients et nos candidats pour créer des relations durables et fructueuses.',
  },
    ],
    services: [
  {
    title: 'Cybersécurité',
    description: 'Protection des systèmes, audits de sécurité et gestion des risques.',
  },
  {
    title: 'Intelligence Artificielle',
    description: 'Solutions IA, automatisation et intégration de modèles intelligents.',
  },
  {
    title: 'Réseaux & Télécom',
    description: 'Infrastructures réseaux et télécoms pour les entreprises.',
  },
  {
    title: 'Conseil & Expertise IT',
    description: 'Accompagnement stratégique et optimisation des systèmes d\'information.',
  },
    ],
    strengths: [
  {
    icon: TrendingUp,
    title: 'Croissance rapide',
    description: 'Nous accompagnons les entreprises en phase de croissance qui ont besoin de talents tech rapidement.',
  },
  {
    icon: Globe,
    title: 'Portée internationale',
    description: 'Notre réseau s\'étend au-delà des frontières pour répondre aux besoins des scale-ups internationales.',
  },
  {
    icon: CheckCircle2,
    title: 'Qualité garantie',
    description: 'Chaque candidat est préqualifié et validé par nos experts techniques avant présentation.',
  },
    ],
  },
  EN: {
    pageTitle: 'About Sil Talents Tech',
    altImage: 'About Sil Talents Tech',
    introParagraph: 'A specialized recruitment firm that transforms how companies find their technological talent. We combine technical expertise and a human approach to build high-performing teams.',
    expertiseTitle: 'Our Areas of Expertise',
    whyChooseTitle: 'Why Choose Us',
    values: [
      {
        icon: Target,
        title: 'Excellence',
        description: 'We strive for excellence in every recruitment, ensuring the best match between talent and companies.',
      },
      {
        icon: Users,
        title: 'Proximity',
        description: 'Personalized and human support, with continuous follow-up throughout the recruitment process.',
      },
      {
        icon: Award,
        title: 'Expertise',
        description: 'In-depth knowledge of tech professions and market challenges for informed and strategic advice.',
      },
      {
        icon: Heart,
        title: 'Commitment',
        description: 'Strong commitment to our clients and candidates to create lasting and fruitful relationships.',
      },
    ],
    services: [
      {
        title: 'Cybersecurity',
        description: 'System protection, security audits, and risk management.',
      },
      {
        title: 'Artificial Intelligence',
        description: 'AI solutions, automation, and integration of intelligent models.',
      },
      {
        title: 'Networks & Telecom',
        description: 'Network and telecom infrastructures for businesses.',
      },
      {
        title: 'IT Consulting & Expertise',
        description: 'Strategic support and optimization of information systems.',
      },
    ],
    strengths: [
      {
        icon: TrendingUp,
        title: 'Rapid growth',
        description: 'We support companies in growth phase that need tech talent quickly.',
      },
      {
        icon: Globe,
        title: 'International reach',
        description: 'Our network extends beyond borders to meet the needs of international scale-ups.',
      },
      {
        icon: CheckCircle2,
        title: 'Guaranteed quality',
        description: 'Each candidate is pre-qualified and validated by our technical experts before presentation.',
      },
    ],
  },
}

export default function AboutPage() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Première Section : Hero avec titre, paragraphe et grille 2x2 des valeurs */}
      <section className="relative bg-black text-white pt-0" style={{ minHeight: '100vh' }}>
        {/* Cercle lumineux - Sort du bord gauche */}
        <LuminousCircle
          top="10%"
          left="-120px"
          width="400px"
          height="400px"
          zIndex={1}
          opacity={0.8}
        />
        {/* Cercle lumineux - Sort du bord droite */}
        <LuminousCircle
          top="10%"
          right="-120px"
          width="400px"
          height="400px"
          zIndex={1}
          opacity={0.8}
        />
        {/* Background Image pleine largeur */}
        <div className="absolute inset-0 z-0 w-full h-full" style={{ minHeight: '100vh' }}>
          <Image
            src={heroImagePath}
            alt={t.altImage}
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay identique à la hero de la page d'accueil */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
          />
        </div>

        {/* Contenu au-dessus de l'image */}
        <div className="relative z-10 mx-auto w-[90%] max-w-[1200px] min-h-[100vh] flex flex-col justify-center pt-28 md:pt-32 pb-12 md:pb-16">
          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-4 md:mb-6 leading-tight text-left"
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
            className="mb-8 md:mb-12 max-w-3xl text-left"
            style={{
              fontFamily: 'Inter',
              fontWeight: 200,
              fontSize: 'clamp(14px, 2.4vw, 18px)',
              lineHeight: '28px',
              color: '#999999',
            }}
          >
            {t.introParagraph}
          </motion.p>

          {/* Grille 2x2 des valeurs */}
          <div className="mb-8 md:mb-12">
            {/* Mobile: scroll horizontal */}
            <div className="md:hidden flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
              {t.values.map((value, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="min-w-[85%] snap-center bg-[#0000006B] backdrop-blur-sm p-8 text-left"
                  >
                    <h3
                      className="mb-4 text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 300,
                        fontSize: '20px',
                      }}
                    >
                      {value.title}
                    </h3>
                    <p
                      className="text-[#999999]"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 200,
                        fontSize: '14px',
                        lineHeight: '22px',
                      }}
                    >
                      {value.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            {/* Desktop: grille 2x2 */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              {t.values.map((value, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-[#0000006B] backdrop-blur-sm p-10 text-left flex flex-col hover:-translate-y-1 hover:bg-[#00000080] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)] transition-all duration-300"
                  >
                    <h3
                      className="mb-4 text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 300,
                        fontSize: '22px',
                      }}
                    >
                      {value.title}
                    </h3>
                    <p
                      className="text-[#999999] flex-grow"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 200,
                        fontSize: '16px',
                        lineHeight: '26px',
                      }}
                    >
                      {value.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Gradient de transition vers la section suivante */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
      </section>

      {/* Section Domaines d'Expertise */}
      <section className="relative py-12 md:py-16" style={{ backgroundColor: '#1A1A1A' }}>
        {/* Cercle lumineux - Sort du bord droite */}
        <LuminousCircle
          top="10%"
          right="-120px"
          width="400px"
          height="400px"
          zIndex={1}
          opacity={0.8}
        />
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-12 text-left text-white"
            style={{
              fontFamily: 'Inter',
              fontWeight: 300,
              fontSize: 'clamp(28px, 4vw, 38px)',
            }}
          >
            {t.expertiseTitle}
          </motion.h2>

          {/* Mobile: scroll horizontal */}
          <div className="md:hidden flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
            {t.services.map((service, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="min-w-[85%] snap-center bg-[#0000006B] backdrop-blur-sm p-6 text-left"
                >
                  <div className="mb-4">
                    <Image
                      src="/assets/Images/circle-wavy-check-duotone 1.svg"
                      alt="Expertise icon"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <h3
                    className="mb-3 text-white"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 100,
                      fontSize: '24px',
                      minHeight: '72px', // Aligner les titres
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 100,
                      fontSize: '14px',
                      lineHeight: '22px',
                      color: '#999999',
                      minHeight: '66px', // Aligner les paragraphes
                    }}
                  >
                    {service.description}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Desktop: grille */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
            {t.services.map((service, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-[#0000006B] backdrop-blur-sm p-8 flex flex-col text-left hover:-translate-y-1 hover:bg-[#00000080] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)] transition-all duration-300"
                >
                  <div className="mb-6">
                    <Image
                      src="/assets/Images/circle-wavy-check-duotone 1.svg"
                      alt="Expertise icon"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <h3
                    className="mb-4 text-white"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontSize: '22px',
                      minHeight: '66px', // Aligner les titres
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="flex-grow text-[#999999]"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 100,
                      fontSize: '16px',
                      lineHeight: '26px',
                      minHeight: '78px', // Aligner les paragraphes
                    }}
                  >
                    {service.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section Pourquoi Nous Choisir */}
      <section className="relative pt-12 md:pt-16 pb-0" style={{ backgroundColor: '#1A1A1A' }}>
        {/* Cercle lumineux - Sort du bord gauche */}
        <LuminousCircle
          top="10%"
          left="-120px"
          width="400px"
          height="400px"
          zIndex={1}
          opacity={0.8}
        />
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-12 text-left text-white"
            style={{
              fontFamily: 'Inter',
              fontWeight: 300,
              fontSize: 'clamp(28px, 4vw, 38px)',
            }}
          >
            {t.whyChooseTitle}
          </motion.h2>

          {/* Mobile: scroll horizontal */}
          <div className="md:hidden flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
            {t.strengths.map((strength, index) => {
              const Icon = strength.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="min-w-[85%] snap-center bg-[#0000006B] backdrop-blur-sm p-6 text-left"
                >
                  <Icon className="w-10 h-10 mb-6" style={{ color: '#297BFF' }} />
                  <h3
                    className="mb-3 text-white"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontSize: '20px',
                    }}
                  >
                    {strength.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 100,
                      fontSize: '14px',
                      lineHeight: '22px',
                      color: '#999999',
                    }}
                  >
                    {strength.description}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Desktop: grille */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
            {t.strengths.map((strength, index) => {
              const Icon = strength.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-[#0000006B] backdrop-blur-sm p-8 flex flex-col text-left hover:-translate-y-1 hover:bg-[#00000080] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)] transition-all duration-300"
                >
                  <Icon className="w-12 h-12 mb-8" style={{ color: '#297BFF' }}   strokeWidth={1}/>
                  <h3
                    className="mb-4 text-white"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontSize: '22px',
                    }}
                  >
                    {strength.title}
                  </h3>
                  <p
                    className="flex-grow text-[#999999]"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 100,
                      fontSize: '16px',
                      lineHeight: '26px',
                    }}
                  >
                    {strength.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
       
      </section>
    </div>
  )
}