'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import LuminousCircle from '@/components/ui/LuminousCircle'

const heroImagePath = '/assets/Images/ImgHero.jpg'

const translations = {
  FR: {
    title: '404',
    subtitle: 'Page non trouvée',
    description: 'Désolé, la page que vous recherchez n\'existe pas ou a été déplacée.',
    backHome: 'Retour à l\'accueil',
    goBack: 'Page précédente',
  },
  EN: {
    title: '404',
    subtitle: 'Page Not Found',
    description: 'Sorry, the page you are looking for does not exist or has been moved.',
    backHome: 'Back to Home',
    goBack: 'Go Back',
  },
}

export default function NotFound() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="relative min-h-screen flex items-center bg-black text-white overflow-hidden pt-28 md:pt-32">
      {/* Background Image - Full Width */}
      <div className="absolute inset-0 z-0 w-full">
        <Image
          src={heroImagePath}
          alt="404 Background"
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
      {/* Cercle lumineux en bas - Sort du bord gauche */}
      <LuminousCircle
        bottom="10%"
        left="-120px"
        width="400px"
        height="400px"
        zIndex={1}
        opacity={0.8}
      />
      {/* Cercle lumineux en bas - Sort du bord droite */}
      <LuminousCircle
        bottom="10%"
        right="-120px"
        width="400px"
        height="400px"
        zIndex={1}
        opacity={0.8}
      />

      {/* Content Container */}
      <div className="relative z-10 mx-auto w-[90%] max-w-[1200px] text-center py-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6"
          style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: 'clamp(80px, 15vw, 180px)',
            color: '#FFFFFF',
            lineHeight: '1',
          }}
        >
          {t.title}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6"
          style={{
            fontFamily: 'Inter',
            fontWeight: 300,
            fontSize: 'clamp(28px, 4vw, 48px)',
            color: '#FFFFFF',
          }}
        >
          {t.subtitle}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-12 max-w-2xl mx-auto"
          style={{
            fontFamily: 'Inter',
            fontWeight: 200,
            fontSize: 'clamp(16px, 2vw, 20px)',
            lineHeight: '28px',
            color: '#999999',
          }}
        >
          {t.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#297BFF] hover:bg-[#1f63d6] transition-colors text-white"
            style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '16px',
              textDecoration: 'none',
            }}
          >
            <Home className="w-5 h-5" />
            <span>{t.backHome}</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-transparent border border-[#999999] hover:border-[#D9D9D9] hover:text-[#D9D9D9] transition-colors text-white"
            style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '16px',
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.goBack}</span>
          </button>
        </motion.div>
      </div>

      {/* Bottom shadow/gradient to blend into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
    </div>
  )
}


