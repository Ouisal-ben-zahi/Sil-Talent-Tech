'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const translations = {
  FR: {
    title: 'Votre croissance technologique mérite les meilleurs talents.',
    paragraph: 'Nos experts en recrutement IT, cybersécurité et intelligence artificielle vous accompagnent pour bâtir des systèmes robustes, innovants et évolutifs. Disponibles 24 h/24 - 7 j/7.',
    quickLinks: [
  { name: 'Cybersécurité', href: '/services/cybersecurite' },
  { name: 'Intelligence Artificielle', href: '/services/intelligence-artificielle' },
      { name: 'Réseaux & Télécom', href: '/services/reseaux-telecom' },
  { name: 'Conseil & Expertise IT', href: '/services/conseil-expertise' },
    ],
  },
  EN: {
    title: 'Your technological growth deserves the best talent.',
    paragraph: 'Our experts in IT recruitment, cybersecurity, and artificial intelligence support you in building robust, innovative, and scalable systems. Available 24/7.',
    quickLinks: [
      { name: 'Cybersecurity', href: '/services/cybersecurite' },
      { name: 'Artificial Intelligence', href: '/services/intelligence-artificielle' },
      { name: 'Networks & Telecom', href: '/services/reseaux-telecom' },
      { name: 'IT Consulting & Expertise', href: '/services/conseil-expertise' },
    ],
  },
}

const talentTechWords = {
  FR: [
    'Expertise Technique',
    'Recrutement IT',
    'Cybersécurité',
    'Intelligence Artificielle',
    'Développement',
    'Cloud Computing',
    'DevOps',
    'Data Science',
    'Réseaux & Télécom',
    'Conseil IT',
    'Innovation',
    'Talents Tech',
  ],
  EN: [
    'Technical Expertise',
    'IT Recruitment',
    'Cybersecurity',
    'Artificial Intelligence',
    'Development',
    'Cloud Computing',
    'DevOps',
    'Data Science',
    'Networks & Telecom',
    'IT Consulting',
    'Innovation',
    'Tech Talent',
  ],
}

export function Hero() {
  const { lang } = useLanguage()
  const [jobKeyword, setJobKeyword] = useState('')
  const [location, setLocation] = useState('')
  const t = translations[lang]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Search:', { jobKeyword, location })
  }

  return (
    <section className="relative min-h-screen flex items-center bg-black text-white overflow-hidden pt-28 md:pt-32">
      {/* Background Image - Full Width */}
      <div className="absolute inset-0 z-0 w-full">
        <Image
          src="/assets/Images/ImgHero.jpg"
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for readability */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
      </div>

      {/* Content Container - Centered, 90% width, max 1200px */}
      <div 
        className="relative z-10 mx-auto flex flex-col justify-between w-[90%] max-w-[1200px] py-10 md:py-16"
      >
        {/* Bloc titre + paragraphe en haut */}
        <div className="flex flex-col w-full md:w-3/5 mb-8">
          {/* Title and Paragraph - Top Left */}
          <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
              className="font-bold mb-6 leading-tight"
              style={{ 
                fontFamily: 'Inter', 
                fontWeight: 400,
                // Typo fluide : 38px à 56px selon la largeur d'écran
                fontSize: 'clamp(38px, 4vw, 56px)',
                color: '#FFFFFF',
              }}
            >
              {t.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base md:text-lg lg:text-xl"
              style={{ 
                fontFamily: 'Inter', 
                fontWeight: 200,
                fontSize: 'clamp(14px, 2.4vw, 18px)',
                lineHeight: '28px',
                letterSpacing: '0',
                color: '#999999'
              }}
            >
              {t.paragraph}
          </motion.p>
          </div>


          {/* Quick Service Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap justify-start gap-4 mb-12 text-left"
          >
            {t.quickLinks.map((link, index) => {
              const isReseauxTelecom = link.name === 'Réseaux & Télécom' || link.name === 'Networks & Telecom'
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-all ${isReseauxTelecom ? 'text-[#297BFF] underline' : 'text-[#F1F1F2] hover:text-[#297BFF]'}`}
                  style={{ 
                    fontFamily: 'Inter', 
                    fontWeight: 300, 
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0',
                    textAlign: 'left'
                  }}
                >
                  {link.name}
                </Link>
              )
            })}
        </motion.div>

        {/* Talent Tech Words - Animated Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className=" overflow-hidden relative"
        >
          <div className="relative">
            {/* Animated scrolling container */}
            <motion.div
              className="flex items-center gap-8 md:gap-12"
              animate={{
                x: ['0%', '-50%'],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 30,
                  ease: 'linear',
                },
              }}
            >
              {/* Double the words for seamless loop */}
              {[...talentTechWords[lang], ...talentTechWords[lang]].map((word, index) => (
                <motion.div
                  key={`${word}-${index}`}
                  className="relative flex items-center flex-shrink-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{
                    delay: 1 + (index % talentTechWords[lang].length) * 0.1,
                    duration: 0.6,
                  }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                >
                  <span
                    className="whitespace-nowrap transition-all duration-300"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 700,
                      fontSize: 'clamp(18px, 2vw, 24px)',
                      letterSpacing: '1px',
                      color: '#D9D9D9',
                      textTransform: 'uppercase',
                    }}
                  >
                    {word.toUpperCase()}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Bottom shadow/gradient to blend into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
    </section>
  )
}
