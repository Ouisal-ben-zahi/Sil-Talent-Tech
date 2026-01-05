'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Shield, Lock, Eye, FileText, UserCheck, Database, Mail } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// Lazy load les blobs de lumière
const LightBlobs = dynamic(() => import('@/components/ui/LightBlobs').then(mod => mod.LightBlobs), { 
  ssr: false,
  loading: () => null
})

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Politique de Confidentialité',
    introParagraph: 'Sil Talents Tech s\'engage à protéger votre vie privée et vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.',
    sections: [
      {
        icon: Database,
        title: 'Données collectées',
        content: [
          'Informations d\'identification : nom, prénom, email, téléphone',
          'Informations professionnelles : CV, LinkedIn, portfolio, compétences',
          'Données de navigation : cookies, logs de connexion, préférences',
          'Informations de candidature : postes recherchés, disponibilité, localisation'
        ]
      },
      {
        icon: Eye,
        title: 'Utilisation des données',
        content: [
          'Gestion de vos candidatures et suivi de votre profil',
          'Mise en relation avec des opportunités adaptées à votre profil',
          'Amélioration de nos services de recrutement',
          'Communication concernant nos services et opportunités',
          'Respect des obligations légales et réglementaires'
        ]
      },
      {
        icon: UserCheck,
        title: 'Partage des données',
        content: [
          'Vos données peuvent être partagées avec nos partenaires CRM (Boom Manager) pour la gestion de vos candidatures',
          'Nous ne vendons jamais vos données à des tiers',
          'Vos données peuvent être transmises aux entreprises pour lesquelles vous postulez, uniquement avec votre consentement',
          'Nous pouvons partager des données agrégées et anonymisées à des fins statistiques'
        ]
      },
      {
        icon: Shield,
        title: 'Vos droits',
        content: [
          'Droit d\'accès : vous pouvez demander l\'accès à vos données personnelles',
          'Droit de rectification : vous pouvez corriger vos données inexactes',
          'Droit à l\'effacement : vous pouvez demander la suppression de vos données',
          'Droit d\'opposition : vous pouvez vous opposer au traitement de vos données',
          'Droit à la portabilité : vous pouvez récupérer vos données dans un format structuré'
        ]
      },
      {
        icon: Lock,
        title: 'Sécurité',
        content: [
          'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles avancées',
          'Chiffrement des données sensibles en transit et au repos',
          'Accès restreint aux données personnelles aux seuls membres autorisés',
          'Surveillance régulière de nos systèmes pour détecter toute intrusion',
          'Sauvegardes régulières pour prévenir la perte de données'
        ]
      },
      {
        icon: FileText,
        title: 'Cookies',
        content: [
          'Notre site utilise des cookies pour améliorer votre expérience de navigation',
          'Cookies essentiels : nécessaires au fonctionnement du site',
          'Cookies analytiques : pour comprendre comment vous utilisez notre site',
          'Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur',
          'La désactivation de certains cookies peut affecter certaines fonctionnalités du site'
        ]
      },
      {
        icon: Mail,
        title: 'Contact',
        content: [
          'Pour exercer vos droits ou pour toute question concernant cette politique, contactez-nous à :',
          'Email :  Paul.dearaujo@sil-talents.ma',
          'Pour plus d\'informations sur le RGPD, consultez notre page dédiée'
        ]
      }
    ]
  },
  EN: {
    pageTitle: 'Privacy Policy',
    introParagraph: 'Sil Talents Tech is committed to protecting your privacy and personal data. This policy explains how we collect, use and protect your information.',
    sections: [
      {
        icon: Database,
        title: 'Data collected',
        content: [
          'Identification information: name, first name, email, phone',
          'Professional information: CV, LinkedIn, portfolio, skills',
          'Navigation data: cookies, connection logs, preferences',
          'Application information: positions sought, availability, location'
        ]
      },
      {
        icon: Eye,
        title: 'Use of data',
        content: [
          'Management of your applications and profile tracking',
          'Matching with opportunities suited to your profile',
          'Improving our recruitment services',
          'Communication regarding our services and opportunities',
          'Compliance with legal and regulatory obligations'
        ]
      },
      {
        icon: UserCheck,
        title: 'Data sharing',
        content: [
          'Your data may be shared with our CRM partners (Boom Manager) for managing your applications',
          'We never sell your data to third parties',
          'Your data may be transmitted to companies you apply to, only with your consent',
          'We may share aggregated and anonymized data for statistical purposes'
        ]
      },
      {
        icon: Shield,
        title: 'Your rights',
        content: [
          'Right of access: you can request access to your personal data',
          'Right to rectification: you can correct your inaccurate data',
          'Right to erasure: you can request deletion of your data',
          'Right to object: you can object to the processing of your data',
          'Right to portability: you can retrieve your data in a structured format'
        ]
      },
      {
        icon: Lock,
        title: 'Security',
        content: [
          'We implement advanced technical and organizational security measures',
          'Encryption of sensitive data in transit and at rest',
          'Restricted access to personal data to authorized members only',
          'Regular monitoring of our systems to detect any intrusion',
          'Regular backups to prevent data loss'
        ]
      },
      {
        icon: FileText,
        title: 'Cookies',
        content: [
          'Our site uses cookies to improve your browsing experience',
          'Essential cookies: necessary for the site to function',
          'Analytical cookies: to understand how you use our site',
          'You can manage your cookie preferences in your browser settings',
          'Disabling certain cookies may affect some site features'
        ]
      },
      {
        icon: Mail,
        title: 'Contact',
        content: [
          'To exercise your rights or for any questions about this policy, contact us at:',
          'Email:  Paul.dearaujo@sil-talents.ma',
          'For more information on GDPR, visit our dedicated page'
        ]
      }
    ]
  }
}

export default function PolitiqueConfidentialitePage() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-sil-dark relative">
      {/* Section avec BG Photo */}
      <section 
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url(${heroImagePath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay sombre */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
        
        {/* Gradient en bas */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />

        {/* Light Blobs */}
        <LightBlobs />

        {/* Contenu */}
        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto py-12 md:py-16">
          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 md:mb-8 text-sil-white"
            style={{ 
              fontFamily: 'Inter', 
              fontWeight: 400, 
              fontStyle: 'normal', 
              fontSize: 'clamp(28px, 4vw, 48px)',
              marginTop: '100px'
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

          {/* Sections */}
          <div className="space-y-6 md:space-y-8">
            {t.sections.map((section, index) => {
              const IconComponent = section.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-[#0000006B] backdrop-blur-sm p-6 md:p-10 text-left"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-[#297BFF] flex-shrink-0 mt-1" strokeWidth={1} />
                    <h2
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 300,
                        fontSize: 'clamp(18px, 2.5vw, 24px)',
                      }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-2 ml-10 md:ml-12">
                    {section.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-[#999999] flex items-start gap-2"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 200,
                          fontSize: 'clamp(13px, 1.8vw, 16px)',
                          lineHeight: '24px',
                        }}
                      >
                        <span className="text-[#297BFF] mt-1.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>

          {/* Lien RGPD */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-8 md:mt-12 text-center"
          >
            <a
              href="/rgpd"
              className="inline-block text-[#297BFF] hover:text-[#1f63d6] transition-colors"
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '16px',
              }}
            >
              {lang === 'FR' ? 'En savoir plus sur le RGPD →' : 'Learn more about GDPR →'}
            </a>
          </motion.div>
        </div>

        {/* Gradient de transition */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
      </section>
    </div>
  )
}
