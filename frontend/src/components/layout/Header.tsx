'use client'

import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'
import { isAuthenticated, getUserType, getValidToken, clearAuthData } from '@/lib/auth'

const HeaderComponent = () => {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)
  const { lang, setLang } = useLanguage()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userType, setUserType] = useState<'admin' | 'candidate' | null>(null)
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null)

  // Fonction pour récupérer la photo de profil du candidat depuis l'API
  const fetchCandidateProfilePhoto = async () => {
    try {
      const response = await api.get('/candidates/photo-history')
      const photos = response.data?.data || response.data || []

      if (!Array.isArray(photos) || photos.length === 0) {
        return null
      }

      const latestPhoto = photos[0]
      if (!latestPhoto?.id) return null

      const fileResponse = await api.get(`/candidates/photo/${latestPhoto.id}/file`, {
        responseType: 'blob',
      } as any)

      const blob = fileResponse.data as Blob
      const objectUrl = URL.createObjectURL(blob)

      setUserProfilePicture(objectUrl)
      if (typeof window !== 'undefined') {
        localStorage.setItem('candidateProfilePicture', objectUrl)
      }
      return objectUrl
    } catch (error) {
      console.log('Aucune photo de profil trouvée ou erreur:', error)
      return null
    }
  }

  useEffect(() => {
    // Vérifier la position initiale
    setIsScrolled(window.scrollY > 20)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fonction pour vérifier et mettre à jour l'état d'authentification
  const checkAuthStatus = useCallback(() => {
    if (typeof window === 'undefined') return

    // Vérifier si le token est valide (non expiré) au chargement
    const token = getValidToken()
    const authenticated = isAuthenticated()
    
    // Si aucun token valide n'existe, afficher uniquement "Se connecter"
    if (!authenticated || token === null) {
      setIsLoggedIn(false)
      setUserType(null)
      setUserName(null)
      setUserProfilePicture(null)
      return
    }

    // Token valide, continuer avec la logique normale
    setIsLoggedIn(true)

    // Déterminer le type d'utilisateur et récupérer les informations
    const storedCandidateName = localStorage.getItem('candidateName')
    const storedAdminName = localStorage.getItem('adminName')
    const storedProfilePicture = localStorage.getItem('candidateProfilePicture')
    const userTypeFromAuth = getUserType()
    
    // Vérifier si c'est un admin (présence de adminName ou route /admin)
    const isAdmin = userTypeFromAuth === 'admin' || !!storedAdminName || (pathname?.startsWith('/admin') && !storedCandidateName)
    
    if (isAdmin && authenticated) {
      // Admin : toujours afficher le logo admin
      setUserType('admin')
      setUserName(storedAdminName)
      setUserProfilePicture('/assets/Images/LogoAdmin.jpg')
    } else if (storedCandidateName && authenticated) {
      // Candidat
      setUserType('candidate')
      setUserName(storedCandidateName)
      
      // Si une photo existe dans localStorage (URL blob valide)
      if (storedProfilePicture && storedProfilePicture !== 'null' && storedProfilePicture !== '' && storedProfilePicture.startsWith('blob:')) {
        setUserProfilePicture(storedProfilePicture)
      } else if (token) {
        // Pas de photo en cache, récupérer depuis l'API
        setUserProfilePicture(null) // Afficher le profil par défaut en attendant
        fetchCandidateProfilePhoto()
      } else {
        setUserProfilePicture(null)
      }
    } else {
      setUserType(null)
      setUserName(null)
      setUserProfilePicture(null)
    }
  }, [pathname])

  // Vérifier l'authentification au chargement initial et lors du changement de route
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Écouter les changements de localStorage pour détecter les déconnexions
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = () => {
      checkAuthStatus()
    }

    // Écouter les changements de localStorage (déconnexion depuis un autre onglet)
    window.addEventListener('storage', handleStorageChange)
    
    // Vérifier périodiquement si le token est toujours valide (toutes les 30 secondes)
    const interval = setInterval(() => {
      checkAuthStatus()
    }, 30000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [checkAuthStatus])

  const navLinks = [
    { href: '/', label: lang === 'FR' ? 'Accueil' : 'Home' },
    { href: '/a-propos', label: lang === 'FR' ? 'À propos' : 'About' },
    { href: '/services', label: lang === 'FR' ? 'Nos Services' : 'Services', hasMenu: true },
    { href: '/offres', label: lang === 'FR' ? 'Postuler' : 'Jobs' },
    { href: '/ressources', label: lang === 'FR' ? 'Ressources' : 'Resources' },
    { href: '/contact', label: lang === 'FR' ? 'Contact' : 'Contact' },
  ]

  const servicesLinks = [
    {
      href: '/services/cybersecurite',
      label: lang === 'FR' ? 'Cybersécurité' : 'Cybersecurity',
    },
    {
      href: '/services/intelligence-artificielle',
      label: lang === 'FR' ? 'Intelligence Artificielle' : 'Artificial Intelligence',
    },
    {
      href: '/services/reseaux-telecom',
      label: lang === 'FR' ? 'Réseaux & Télécom' : 'Networks & Telecom',
    },
    {
      href: '/services/conseil-expertise',
      label: lang === 'FR' ? 'Conseil & Expertise IT' : 'IT Consulting & Expertise',
    },
  ]

  const languageOptions: { code: 'EN' | 'FR'; label: string; image: string }[] = [
    { code: 'EN', label: 'English', image: '/assets/Images/drapeau ang.png' },
    { code: 'FR', label: 'Français', image: '/assets/Images/drapeau fr.png' },
  ]

  const isAdminRoute = pathname?.startsWith('/admin')
  const accountHref = isAdminRoute ? '/admin/dashboard' : '/candidat/dashboard'

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'top-0' : 'top-[20px]'
      }`}
    >
      <nav
        className={`px-4 md:px-6 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-gradient-to-b from-[#101010] via-[#151515] to-black backdrop-blur-lg shadow-[0_10px_40px_rgba(0,0,0,0.75)]'
            : 'py-[10px] backdrop-blur-sm bg-black/75 shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
        }`}
        style={{ 
          width: isScrolled ? '100%' : '90%', 
          maxWidth: isScrolled ? '100%' : '1200px', 
          margin: isScrolled ? '0' : '20px auto',
          border: 'none'
        }}
      >
        <div className={`flex items-center justify-between gap-6 transition-all duration-300 ${
          isScrolled ? 'max-w-[1200px] mx-auto px-4 md:px-6' : ''
        }`}>
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <div className={`relative flex items-center transition-all duration-300 ${
              isScrolled ? 'h-[72px] w-[208px]' : 'h-[72px] w-[208px]'
            }`}>
              <Image
                src="/assets/Images/logo.png"
                alt="Sil Talents Tech"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden lg:flex items-center justify-center flex-1 transition-all duration-300 ${
            isScrolled ? 'gap-4' : 'gap-6'
          }`}>
            {navLinks.map((link) => {
          const isRoot = link.href === '/'
              const currentPath = pathname || '/'
          const isActive = isRoot
                ? currentPath === '/'
                : currentPath === link.href || currentPath.startsWith(link.href + '/')

              if (link.hasMenu) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsServicesOpen(!isServicesOpen)
                      }}
                      className={`transition-all duration-150 font-light text-sm inline-flex items-center gap-1 ${
                        isActive ? 'text-[#297BFF]' : 'text-white hover:text-[#297BFF] hover:-translate-y-0.5'
                      }`}
                      style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: isActive ? 300 : 200 }}
                    >
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <AnimatePresence>
                      {isServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#1A1A1A] shadow-xl min-w-[240px] z-50 rounded-none"
                        >
                          {servicesLinks.map((item) => (
                            <div key={item.href} className="px-4 py-2">
                              <Link
                                href={item.href}
                                className="block px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                              >
                                {item.label}
                              </Link>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-all duration-150 font-light text-sm inline-flex items-center gap-1 ${
                    isActive ? 'text-[#297BFF]' : 'text-white hover:text-[#297BFF] hover:-translate-y-0.5'
                  }`}
                  style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: isActive ? 300 : 200 }}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Actions */}
          <div className={`hidden lg:flex items-center transition-all duration-300 ${
            isScrolled ? 'gap-2' : 'gap-3'
          }`}>
            {/* Language selector */}
            <div
              className="relative"
              onMouseEnter={() => setIsLangOpen(true)}
              onMouseLeave={() => setIsLangOpen(false)}
            >
              <button
                type="button"
                className="flex items-center justify-end gap-2 w-[120px] px-3 py-2  text-[#D9D9D9]  hover:shadow-lg transition-all duration-300 cursor-pointer rounded-none"
                style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight :100 }}
              >
                {(() => {
                  const current = languageOptions.find((l) => l.code === lang)
                  if (!current) return null
                  return (
                    <Image
                      src={current.image}
                      alt={current.label}
                      width={32}
                      height={24}
                      className="object-cover rounded-sm"
                      quality={100}
                    />
                  )
                })()}
                <ChevronDown className="w-4 h-4 text-[#999999]" />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 bg-black/90 border border-white/10 shadow-lg rounded-none min-w-[140px] py-2 z-50"
                  >
                    {languageOptions.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setLang(item.code)
                          setIsLangOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 bg-black/50 text-[#D9D9D9] hover:bg-[#2A2A2A] hover:text-[#297BFF] transition-all duration-150 text-left rounded-none"
                        style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight :100 }}
                      >
                        <Image
                          src={item.image}
                          alt={item.label}
                          width={32}
                          height={24}
                          className="object-cover rounded-sm"
                          quality={100}
                        />
                        <span>{item.code}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {isLoggedIn ? (
              <Link
                href={accountHref}
                className="inline-flex items-center gap-2 text-white hover:text-[#297BFF] transition-all duration-150 text-sm font-medium hover:-translate-y-0.5"
                style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 500 }}
              >
                <div className="relative">
                  {userType === 'admin' ? (
                    // Admin : toujours afficher le logo admin
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                      <Image
                        src="/assets/Images/LogoAdmin.jpg"
                        alt="Admin"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : userProfilePicture && userProfilePicture !== '/assets/Images/LogoAdmin.jpg' ? (
                    // Candidat avec photo : afficher la photo
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                      <Image
                        src={userProfilePicture}
                        alt={userName || 'Profile'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={() => {
                          // Si l'image ne charge pas, réinitialiser à null pour afficher l'avatar par défaut
                          setUserProfilePicture(null)
                        }}
                      />
                    </div>
                  ) : (
                    // Candidat sans photo : afficher avatar par défaut avec initiale
                  <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex items-center justify-center border-2 border-white/20">
                    {userName ? (
                      <span 
                        className="text-[#2A2A2A] font-semibold"
                        style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600 }}
                      >
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-5 h-5 text-[#2A2A2A]" />
                    )}
                  </div>
                  )}
                </div>
                <span>{userName || (userType === 'admin' ? 'Admin' : 'Mon compte')}</span>
              </Link>
            ) : (
              <Link
                href="/candidat/login"
                className="px-6 py-3 bg-[#297BFF] hover:bg-[#1f63d6] text-white text-sm transition-all duration-150 rounded-none hover:-translate-y-0.5 min-w-[140px]"
                style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 200 }}
              >
                Se connecter
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/90 border-t border-white/10"
          >
            <div
              className="py-6 space-y-4"
              style={{ width: '90%', maxWidth: '1200px', margin: '0 auto' }}
            >
              {navLinks.map((link) => {
                const isRoot = link.href === '/'
                const currentPath = pathname || '/'
                const isActive = isRoot
                  ? currentPath === '/'
                  : currentPath === link.href || currentPath.startsWith(link.href + '/')

                // Si le lien a un menu (Services), afficher un bouton avec sous-menu
                if (link.hasMenu) {
                  return (
                    <div key={link.href} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                        className={`w-full flex items-center justify-between transition-all duration-150 font-light py-2 ${
                          isActive ? 'text-[#297BFF]' : 'text-white hover:text-[#297BFF]'
                        }`}
                        style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: isActive ? 300 : 200 }}
                      >
                        <span>{link.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isMobileServicesOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 pl-4 space-y-1">
                              {servicesLinks.map((serviceLink) => {
                                const isServiceActive = currentPath === serviceLink.href || currentPath.startsWith(serviceLink.href + '/')
                                return (
                                  <Link
                                    key={serviceLink.href}
                                    href={serviceLink.href}
                                    onClick={() => {
                                      setIsMobileServicesOpen(false)
                                      setIsMobileMenuOpen(false)
                                    }}
                                    className={`block py-2 text-left transition-all duration-150 rounded-none ${
                                      isServiceActive
                                        ? 'bg-[#297BFF]/20 text-[#297BFF]'
                                        : 'text-white hover:text-[#297BFF] hover:bg-white/5'
                                    }`}
                                    style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: isServiceActive ? 300 : 200 }}
                                  >
                                    {serviceLink.label}
                                  </Link>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }

                // Sinon, afficher un lien normal
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block transition-all duration-150 font-light py-2 ${
                      isActive ? 'text-[#297BFF]' : 'text-white hover:text-[#297BFF]'
                    }`}
                    style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: isActive ? 300 : 200 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              
              {/* Language selector for mobile */}
              <div className="relative pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
                  className="w-full flex items-center justify-between py-2 text-white hover:text-[#297BFF] transition-all duration-150"
                  style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 200 }}
                >
                  <span>{lang === 'FR' ? 'Langue' : 'Language'}</span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const current = languageOptions.find((l) => l.code === lang)
                      if (!current) return null
                      return (
                        <Image
                          src={current.image}
                          alt={current.label}
                          width={32}
                          height={24}
                          className="object-cover rounded-sm"
                          quality={100}
                        />
                      )
                    })()}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isMobileLangOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {isMobileLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-1">
                        {languageOptions.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => {
                              setLang(item.code)
                              setIsMobileLangOpen(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-all duration-150 rounded-none ${
                              lang === item.code
                                ? 'bg-[#297BFF]/20 text-[#297BFF]'
                                : 'text-white hover:text-[#297BFF] hover:bg-white/5'
                            }`}
                            style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: lang === item.code ? 300 : 200 }}
                          >
                            <Image
                              src={item.image}
                              alt={item.label}
                              width={32}
                              height={24}
                              className="object-cover rounded-sm"
                              quality={100}
                            />
                            <span>{item.code}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {isLoggedIn ? (
                <Link
                  href={accountHref}
                  className="flex items-center gap-2 text-white hover:text-[#297BFF] transition-all duration-150 font-medium py-2"
                  style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 500 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative">
                    {userType === 'admin' ? (
                      // Admin : toujours afficher le logo admin
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                        <Image
                          src="/assets/Images/LogoAdmin.jpg"
                          alt="Admin"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : userProfilePicture && userProfilePicture !== '/assets/Images/LogoAdmin.jpg' ? (
                      // Candidat avec photo : afficher la photo
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                        <Image
                          src={userProfilePicture}
                          alt={userName || 'Profile'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={() => {
                            // Si l'image ne charge pas, réinitialiser à null pour afficher l'avatar par défaut
                            setUserProfilePicture(null)
                          }}
                        />
                      </div>
                    ) : (
                      // Candidat sans photo : afficher avatar par défaut avec initiale
                    <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex items-center justify-center border-2 border-white/20">
                      {userName ? (
                        <span 
                          className="text-[#2A2A2A] font-semibold"
                          style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600 }}
                        >
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-5 h-5 text-[#2A2A2A]" />
                      )}
                    </div>
                    )}
                  </div>
                  <span>{userName || (userType === 'admin' ? 'Admin' : 'Mon compte')}</span>
                </Link>
              ) : (
                <Link
                  href="/candidat/login"
                  className="block text-center px-6 py-4 bg-[#297BFF] hover:bg-[#1f63d6] text-white transition-all duration-150 rounded-none min-w-[140px] mx-auto"
                  style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 200 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Se connecter
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// Memoize Header pour éviter les re-renders inutiles
export const Header = memo(HeaderComponent)



