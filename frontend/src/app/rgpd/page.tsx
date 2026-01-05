'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Shield, Lock, Database, FileText, UserCheck, Clock, Mail, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// Lazy load les blobs de lumière
const LightBlobs = dynamic(() => import('@/components/ui/LightBlobs').then(mod => mod.LightBlobs), { 
  ssr: false,
  loading: () => null
})

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Politique de Confidentialité et RGPD',
    introParagraph: 'Sil Talents Tech s\'engage à respecter le Règlement Général sur la Protection des Données (RGPD) et à protéger vos données personnelles. Cette page vous informe sur vos droits et sur la manière dont nous traitons vos données.',
    sections: [
      {
        icon: Database,
        title: 'Collecte des données',
        content: [
          'Nom et prénom',
          'Adresse email',
          'Numéro de téléphone',
          'CV et documents professionnels',
          'Informations sur le profil professionnel (LinkedIn, portfolio, etc.)',
          'Données de navigation et cookies',
          'Informations de candidature (postes recherchés, disponibilité, localisation)'
        ]
      },
      {
        icon: FileText,
        title: 'Finalité du traitement',
        content: [
          'Gérer vos candidatures et suivre votre profil',
          'Vous proposer des opportunités d\'emploi adaptées à votre profil',
          'Vous contacter concernant vos candidatures et opportunités',
          'Améliorer nos services de recrutement',
          'Respecter nos obligations légales et réglementaires',
          'Analyser les tendances du marché pour mieux vous conseiller'
        ]
      },
      {
        icon: CheckCircle2,
        title: 'Base légale',
        content: [
          'Votre consentement explicite lors de la création de votre compte',
          'L\'exécution de mesures précontractuelles prises à votre demande',
          'L\'exécution d\'un contrat ou de mesures précontractuelles',
          'Le respect d\'une obligation légale à laquelle nous sommes soumis',
          'La poursuite d\'un intérêt légitime dans le cadre de nos activités de recrutement'
        ]
      },
      {
        icon: Clock,
        title: 'Conservation des données',
        content: [
          'Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées',
          'Durée maximale de conservation : 3 ans après votre dernière interaction avec nos services',
          'Les données peuvent être conservées plus longtemps si une obligation légale l\'exige',
          'Vous pouvez demander la suppression anticipée de vos données à tout moment',
          'Les données supprimées sont définitivement effacées de nos systèmes dans un délai de 30 jours'
        ]
      },
      {
        icon: Shield,
        title: 'Vos droits',
        content: [
          'Droit d\'accès : vous pouvez demander l\'accès à toutes vos données personnelles que nous détenons',
          'Droit de rectification : vous pouvez corriger vos données inexactes ou incomplètes',
          'Droit à l\'effacement : vous pouvez demander la suppression de vos données dans certaines conditions',
          'Droit à la limitation du traitement : vous pouvez demander la limitation du traitement de vos données',
          'Droit à la portabilité : vous pouvez récupérer vos données dans un format structuré et couramment utilisé',
          'Droit d\'opposition : vous pouvez vous opposer au traitement de vos données pour des motifs légitimes',
          'Droit de retirer votre consentement à tout moment sans affecter la licéité du traitement effectué avant le retrait'
        ]
      },
      {
        icon: Lock,
        title: 'Sécurité',
        content: [
          'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données',
          'Chiffrement des données sensibles en transit et au repos',
          'Accès restreint aux données personnelles aux seuls membres autorisés de notre équipe',
          'Surveillance régulière de nos systèmes pour détecter toute intrusion ou accès non autorisé',
          'Sauvegardes régulières pour prévenir la perte de données',
          'Formation de notre personnel aux bonnes pratiques de sécurité des données',
          'Audits de sécurité réguliers pour garantir la protection continue de vos données'
        ]
      },
      {
        icon: UserCheck,
        title: 'Transfert de données',
        content: [
          'Vos données peuvent être partagées avec nos partenaires CRM (Boom Manager) pour la gestion de vos candidatures',
          'Vos données peuvent être transmises aux entreprises pour lesquelles vous postulez, uniquement avec votre consentement explicite',
          'Nous ne vendons jamais vos données à des tiers à des fins commerciales',
          'Nous pouvons partager des données agrégées et anonymisées à des fins statistiques',
          'En cas de transfert hors de l\'UE, nous garantissons un niveau de protection adéquat conforme au RGPD'
        ]
      },
      {
        icon: Mail,
        title: 'Contact et exercice de vos droits',
        content: [
          'Pour exercer vos droits ou pour toute question concernant le traitement de vos données personnelles, contactez-nous :',
          'Email :  Paul.dearaujo@sil-talents.ma',
          'Nous nous engageons à répondre à votre demande dans un délai d\'un mois maximum',
          'Si vous n\'êtes pas satisfait de notre réponse, vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l\'Informatique et des Libertés)',
          'Pour plus d\'informations sur vos droits, consultez le site de la CNIL : www.cnil.fr'
        ]
      }
    ]
  },
  EN: {
    pageTitle: 'Privacy Policy and GDPR',
    introParagraph: 'Sil Talents Tech is committed to complying with the General Data Protection Regulation (GDPR) and protecting your personal data. This page informs you about your rights and how we process your data.',
    sections: [
      {
        icon: Database,
        title: 'Data collection',
        content: [
          'First and last name',
          'Email address',
          'Phone number',
          'CV and professional documents',
          'Professional profile information (LinkedIn, portfolio, etc.)',
          'Navigation data and cookies',
          'Application information (positions sought, availability, location)'
        ]
      },
      {
        icon: FileText,
        title: 'Purpose of processing',
        content: [
          'Manage your applications and track your profile',
          'Offer you job opportunities suited to your profile',
          'Contact you regarding your applications and opportunities',
          'Improve our recruitment services',
          'Comply with our legal and regulatory obligations',
          'Analyze market trends to better advise you'
        ]
      },
      {
        icon: CheckCircle2,
        title: 'Legal basis',
        content: [
          'Your explicit consent when creating your account',
          'Performance of pre-contractual measures taken at your request',
          'Performance of a contract or pre-contractual measures',
          'Compliance with a legal obligation to which we are subject',
          'Pursuit of a legitimate interest in the context of our recruitment activities'
        ]
      },
      {
        icon: Clock,
        title: 'Data retention',
        content: [
          'Your data is retained for the duration necessary for the purposes for which it was collected',
          'Maximum retention period: 3 years after your last interaction with our services',
          'Data may be retained longer if a legal obligation requires it',
          'You can request early deletion of your data at any time',
          'Deleted data is permanently erased from our systems within 30 days'
        ]
      },
      {
        icon: Shield,
        title: 'Your rights',
        content: [
          'Right of access: you can request access to all your personal data we hold',
          'Right to rectification: you can correct your inaccurate or incomplete data',
          'Right to erasure: you can request deletion of your data under certain conditions',
          'Right to restriction of processing: you can request restriction of processing of your data',
          'Right to data portability: you can retrieve your data in a structured and commonly used format',
          'Right to object: you can object to the processing of your data for legitimate reasons',
          'Right to withdraw your consent at any time without affecting the lawfulness of processing carried out before withdrawal'
        ]
      },
      {
        icon: Lock,
        title: 'Security',
        content: [
          'We implement appropriate technical and organizational measures to protect your data',
          'Encryption of sensitive data in transit and at rest',
          'Restricted access to personal data to authorized team members only',
          'Regular monitoring of our systems to detect any intrusion or unauthorized access',
          'Regular backups to prevent data loss',
          'Training of our staff on data security best practices',
          'Regular security audits to ensure continuous protection of your data'
        ]
      },
      {
        icon: UserCheck,
        title: 'Data transfer',
        content: [
          'Your data may be shared with our CRM partners (Boom Manager) for managing your applications',
          'Your data may be transmitted to companies you apply to, only with your explicit consent',
          'We never sell your data to third parties for commercial purposes',
          'We may share aggregated and anonymized data for statistical purposes',
          'In case of transfer outside the EU, we guarantee an adequate level of protection in accordance with GDPR'
        ]
      },
      {
        icon: Mail,
        title: 'Contact and exercising your rights',
        content: [
          'To exercise your rights or for any questions regarding the processing of your personal data, contact us:',
          'Email:  Paul.dearaujo@sil-talents.ma',
          'We commit to responding to your request within a maximum of one month',
          'If you are not satisfied with our response, you can file a complaint with the CNIL (National Commission on Informatics and Liberty)',
          'For more information on your rights, visit the CNIL website: www.cnil.fr'
        ]
      }
    ]
  }
}

export default function RgpdPage() {
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
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-[#297BFF] flex-shrink-0 mt-1" />
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

          {/* Liens utiles */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-8 md:mt-12 space-y-4"
          >
            <div className="bg-[#0000006B] backdrop-blur-sm p-6 md:p-8 text-center">
              <p
                className="text-[#999999] mb-4"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 200,
                  fontSize: '16px',
                }}
              >
                {lang === 'FR' 
                  ? 'Pour plus d\'informations sur vos droits et le RGPD :' 
                  : 'For more information on your rights and GDPR:'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#297BFF] hover:text-[#1f63d6] transition-colors"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '16px',
                  }}
                >
                  {lang === 'FR' ? 'CNIL →' : 'CNIL →'}
                </a>
                <span className="text-[#999999]">|</span>
                <a
                  href="/politique-confidentialite"
                  className="text-[#297BFF] hover:text-[#1f63d6] transition-colors"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '16px',
                  }}
                >
                  {lang === 'FR' ? 'Politique de Confidentialité →' : 'Privacy Policy →'}
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gradient de transition */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
      </section>
    </div>
  )
}
