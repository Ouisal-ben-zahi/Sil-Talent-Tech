'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const translations = {
  FR: {
    apply: 'Postuler',
    loginToApply: 'Se connecter pour postuler',
    contactUs: 'Nous contacter',
  },
  EN: {
    apply: 'Apply',
    loginToApply: 'Login to apply',
    contactUs: 'Contact us',
  },
}

export function ServiceCtaButtons() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(!!token)
  }, [])

  const primaryLabel = isLoggedIn ? t.apply : t.loginToApply
  const primaryHref = isLoggedIn ? '/offres' : '/candidat/login?redirect=/offres'

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        href={primaryHref}
        className="inline-flex items-center justify-center px-6 py-3 bg-[#297BFF] hover:bg-[#1f63d6] text-white transition-colors rounded-none flex-1 sm:flex-none"
        style={{
          fontFamily: 'Inter',
          fontWeight: 500,
          fontSize: '16px',
        }}
      >
        <span>{primaryLabel}</span>
      </Link>
      <Link
        href="/contact"
        className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-[#297BFF] text-[#297BFF] hover:bg-[#297BFF] hover:text-white transition-colors rounded-none flex-1 sm:flex-none"
        style={{
          fontFamily: 'Inter',
          fontWeight: 500,
          fontSize: '16px',
        }}
      >
        <span>{t.contactUs}</span>
      </Link>
    </div>
  )
}


