'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FileText, CheckCircle2, User, Shield, AlertCircle, Mail, Scale, Users } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// Lazy load les blobs de lumière
const LightBlobs = dynamic(() => import('@/components/ui/LightBlobs').then(mod => mod.LightBlobs), { 
  ssr: false,
  loading: () => null
})

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Conditions Générales d\'Utilisation',
    introParagraph: 'Les présentes Conditions Générales d\'Utilisation (CGU) régissent l\'utilisation du site web et des services proposés par Sil Talents Tech. En utilisant notre site, vous acceptez ces conditions dans leur intégralité.',
    sections: [
      {
        icon: FileText,
        title: 'Objet',
        content: [
          'Les présentes CGU s\'appliquent à l\'utilisation du site web Sil Talents Tech et à tous les services proposés sur ce site',
          'Elles définissent les droits et obligations des utilisateurs et de Sil Talents Tech',
          'Toute utilisation du site implique l\'acceptation pleine et entière des présentes conditions',
          'Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser le site'
        ]
      },
      {
        icon: CheckCircle2,
        title: 'Acceptation des CGU',
        content: [
          'L\'accès et l\'utilisation du site sont conditionnés à l\'acceptation des présentes CGU',
          'En créant un compte ou en utilisant nos services, vous reconnaissez avoir lu, compris et accepté ces conditions',
          'Sil Talents Tech se réserve le droit de modifier les CGU à tout moment',
          'Les modifications entrent en vigueur dès leur publication sur le site',
          'Il est de votre responsabilité de consulter régulièrement les CGU pour prendre connaissance des éventuelles modifications'
        ]
      },
      {
        icon: Users,
        title: 'Services proposés',
        content: [
          'Mise en relation entre candidats et entreprises dans le domaine technologique',
          'Gestion de candidatures et suivi de profils',
          'Conseil en recrutement technologique',
          'Accès à un portail candidat pour gérer vos candidatures',
          'Accès à un portail entreprise pour gérer vos recrutements',
          'Publication d\'offres d\'emploi et recherche de candidats'
        ]
      },
      {
        icon: User,
        title: 'Inscription et compte utilisateur',
        content: [
          'Pour utiliser certains services, vous devez créer un compte utilisateur',
          'Vous vous engagez à fournir des informations exactes, complètes et à jour',
          'Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion',
          'Vous devez notifier immédiatement Sil Talents Tech de toute utilisation non autorisée de votre compte',
          'Vous êtes responsable de toutes les activités effectuées sous votre compte',
          'Sil Talents Tech se réserve le droit de suspendre ou supprimer tout compte en cas de violation des CGU'
        ]
      },
      {
        icon: FileText,
        title: 'Candidatures',
        content: [
          'En déposant une candidature, vous garantissez que les informations fournies sont exactes et authentiques',
          'Vous garantissez avoir le droit de partager les documents joints (CV, lettres de motivation, etc.)',
          'Sil Talents Tech se réserve le droit de vérifier l\'authenticité des informations fournies',
          'Les candidatures peuvent être transmises aux entreprises partenaires dans le cadre du processus de recrutement',
          'Vous acceptez que vos données soient utilisées pour vous proposer des opportunités adaptées à votre profil'
        ]
      },
      {
        icon: Scale,
        title: 'Propriété intellectuelle',
        content: [
          'Tous les contenus du site (textes, images, logos, graphismes, etc.) sont la propriété de Sil Talents Tech ou de ses partenaires',
          'Ces contenus sont protégés par les lois françaises et internationales sur la propriété intellectuelle',
          'Toute reproduction, représentation, modification ou adaptation sans autorisation est interdite',
          'Les marques et logos présents sur le site sont la propriété de leurs détenteurs respectifs',
          'Toute utilisation non autorisée peut entraîner des poursuites judiciaires'
        ]
      },
      {
        icon: AlertCircle,
        title: 'Limitation de responsabilité',
        content: [
          'Sil Talents Tech ne peut garantir que les candidatures déposées aboutiront à une embauche',
          'Nous nous efforçons de mettre en relation les meilleurs candidats avec les meilleures opportunités',
          'Le résultat final dépend de nombreux facteurs indépendants de notre volonté',
          'Sil Talents Tech ne peut être tenu responsable des décisions prises par les entreprises partenaires',
          'Nous ne garantissons pas la disponibilité permanente du site et de ses services',
          'Sil Talents Tech ne peut être tenu responsable des dommages directs ou indirects résultant de l\'utilisation du site'
        ]
      },
      {
        icon: Shield,
        title: 'Protection des données personnelles',
        content: [
          'Le traitement de vos données personnelles est régi par notre Politique de Confidentialité et notre page RGPD',
          'En utilisant le site, vous acceptez le traitement de vos données conformément à ces politiques',
          'Vous disposez de droits sur vos données personnelles (accès, rectification, suppression, etc.)',
          'Pour exercer vos droits, contactez-nous à l\'adresse indiquée dans la section Contact',
          'Consultez nos pages dédiées pour plus d\'informations sur la protection de vos données'
        ]
      },
      {
        icon: AlertCircle,
        title: 'Modification des CGU',
        content: [
          'Sil Talents Tech se réserve le droit de modifier les présentes CGU à tout moment',
          'Les modifications sont effectives dès leur publication sur le site',
          'Il est recommandé de consulter régulièrement cette page pour prendre connaissance des éventuelles modifications',
          'Votre utilisation continue du site après modification des CGU vaut acceptation des nouvelles conditions',
          'Si vous n\'acceptez pas les modifications, vous devez cesser d\'utiliser le site'
        ]
      },
      {
        icon: Mail,
        title: 'Contact',
        content: [
          'Pour toute question concernant les présentes CGU, vous pouvez nous contacter :',
          'Email : Paul.dearaujo@sil-talents.ma',
          'Nous nous engageons à répondre à vos questions dans les meilleurs délais',
          'Pour toute réclamation, vous pouvez également utiliser notre formulaire de contact disponible sur le site'
        ]
      }
    ]
  },
  EN: {
    pageTitle: 'Terms and Conditions',
    introParagraph: 'These Terms and Conditions (T&C) govern the use of the website and services offered by Sil Talents Tech. By using our site, you accept these conditions in their entirety.',
    sections: [
      {
        icon: FileText,
        title: 'Purpose',
        content: [
          'These T&C apply to the use of the Sil Talents Tech website and all services offered on this site',
          'They define the rights and obligations of users and Sil Talents Tech',
          'Any use of the site implies full and complete acceptance of these conditions',
          'If you do not accept these conditions, please do not use the site'
        ]
      },
      {
        icon: CheckCircle2,
        title: 'Acceptance of T&C',
        content: [
          'Access to and use of the site are conditional on acceptance of these T&C',
          'By creating an account or using our services, you acknowledge having read, understood and accepted these conditions',
          'Sil Talents Tech reserves the right to modify the T&C at any time',
          'Modifications take effect as soon as they are published on the site',
          'It is your responsibility to regularly consult the T&C to be aware of any modifications'
        ]
      },
      {
        icon: Users,
        title: 'Services offered',
        content: [
          'Matching between candidates and companies in the technology sector',
          'Application management and profile tracking',
          'Technology recruitment consulting',
          'Access to a candidate portal to manage your applications',
          'Access to a company portal to manage your recruitment',
          'Job posting and candidate search'
        ]
      },
      {
        icon: User,
        title: 'Registration and user account',
        content: [
          'To use certain services, you must create a user account',
          'You agree to provide accurate, complete and up-to-date information',
          'You are responsible for maintaining the confidentiality of your login credentials',
          'You must immediately notify Sil Talents Tech of any unauthorized use of your account',
          'You are responsible for all activities performed under your account',
          'Sil Talents Tech reserves the right to suspend or delete any account in case of violation of the T&C'
        ]
      },
      {
        icon: FileText,
        title: 'Applications',
        content: [
          'By submitting an application, you guarantee that the information provided is accurate and authentic',
          'You guarantee having the right to share the attached documents (CV, cover letters, etc.)',
          'Sil Talents Tech reserves the right to verify the authenticity of the information provided',
          'Applications may be transmitted to partner companies as part of the recruitment process',
          'You accept that your data be used to offer you opportunities suited to your profile'
        ]
      },
      {
        icon: Scale,
        title: 'Intellectual property',
        content: [
          'All site content (texts, images, logos, graphics, etc.) is the property of Sil Talents Tech or its partners',
          'This content is protected by French and international laws on intellectual property',
          'Any reproduction, representation, modification or adaptation without authorization is prohibited',
          'Trademarks and logos present on the site are the property of their respective holders',
          'Any unauthorized use may result in legal action'
        ]
      },
      {
        icon: AlertCircle,
        title: 'Limitation of liability',
        content: [
          'Sil Talents Tech cannot guarantee that submitted applications will result in employment',
          'We strive to match the best candidates with the best opportunities',
          'The final result depends on many factors beyond our control',
          'Sil Talents Tech cannot be held responsible for decisions made by partner companies',
          'We do not guarantee permanent availability of the site and its services',
          'Sil Talents Tech cannot be held responsible for direct or indirect damages resulting from the use of the site'
        ]
      },
      {
        icon: Shield,
        title: 'Personal data protection',
        content: [
          'The processing of your personal data is governed by our Privacy Policy and GDPR page',
          'By using the site, you accept the processing of your data in accordance with these policies',
          'You have rights over your personal data (access, rectification, deletion, etc.)',
          'To exercise your rights, contact us at the address indicated in the Contact section',
          'See our dedicated pages for more information on the protection of your data'
        ]
      },
      {
        icon: AlertCircle,
        title: 'Modification of T&C',
        content: [
          'Sil Talents Tech reserves the right to modify these T&C at any time',
          'Modifications are effective as soon as they are published on the site',
          'It is recommended to regularly consult this page to be aware of any modifications',
          'Your continued use of the site after modification of the T&C constitutes acceptance of the new conditions',
          'If you do not accept the modifications, you must stop using the site'
        ]
      },
      {
        icon: Mail,
        title: 'Contact',
        content: [
          'For any questions regarding these T&C, you can contact us:',
          'Email: Paul.dearaujo@sil-talents.ma',
          'We commit to responding to your questions as soon as possible',
          'For any complaint, you can also use our contact form available on the site'
        ]
      }
    ]
  }
}

export default function ConditionsGeneralesPage() {
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
                  ? 'Pour plus d\'informations :' 
                  : 'For more information:'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
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
                <span className="text-[#999999]">|</span>
                <a
                  href="/rgpd"
                  className="text-[#297BFF] hover:text-[#1f63d6] transition-colors"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '16px',
                  }}
                >
                  {lang === 'FR' ? 'RGPD →' : 'GDPR →'}
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









