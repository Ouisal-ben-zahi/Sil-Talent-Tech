'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown, HelpCircle, MessageCircle, FileQuestion, UserCheck, Briefcase, Shield } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// Lazy load les blobs de lumière
const LightBlobs = dynamic(() => import('@/components/ui/LightBlobs').then(mod => mod.LightBlobs), { 
  ssr: false,
  loading: () => null
})

const heroImagePath = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    pageTitle: 'Questions Fréquentes',
    introParagraph: 'Trouvez rapidement les réponses aux questions les plus courantes sur nos services de recrutement technologique.',
    categories: [
      {
        icon: UserCheck,
        title: 'Candidats',
        questions: [
          {
            question: 'Comment puis-je postuler à une offre d\'emploi ?',
            answer: 'Vous pouvez postuler de deux façons : en créant un compte candidat sur notre plateforme et en postulant directement aux offres qui vous intéressent, ou en déposant une candidature rapide avec votre CV. Dans les deux cas, notre équipe étudiera votre profil et vous contactera si votre profil correspond à nos opportunités.'
          },
          {
            question: 'Dois-je payer pour utiliser vos services ?',
            answer: 'Non, nos services sont entièrement gratuits pour les candidats. Sil Talents Tech est rémunéré par les entreprises qui recrutent, jamais par les candidats.'
          },
          {
            question: 'Comment puis-je mettre à jour mon profil ?',
            answer: 'Une fois connecté à votre compte candidat, vous pouvez accéder à votre tableau de bord et modifier vos informations personnelles, votre CV, vos compétences et vos préférences à tout moment.'
          },
          {
            question: 'Combien de temps faut-il pour être contacté après une candidature ?',
            answer: 'Nous nous efforçons de répondre à toutes les candidatures dans un délai de 5 à 7 jours ouvrés. Si votre profil correspond à une opportunité, notre équipe vous contactera par email ou téléphone.'
          },
          {
            question: 'Puis-je postuler à plusieurs offres en même temps ?',
            answer: 'Oui, vous pouvez postuler à autant d\'offres que vous le souhaitez. Chaque candidature est traitée indépendamment et vous pouvez suivre l\'état de vos candidatures depuis votre tableau de bord.'
          }
        ]
      },
      {
        icon: Briefcase,
        title: 'Entreprises',
        questions: [
          {
            question: 'Comment fonctionne votre service de recrutement ?',
            answer: 'Nous analysons vos besoins en recrutement, recherchons et préqualifions les candidats correspondant à vos critères, puis vous présentons les meilleurs profils. Vous choisissez les candidats que vous souhaitez rencontrer et nous organisons les entretiens.'
          },
          {
            question: 'Quels types de profils recrutez-vous ?',
            answer: 'Nous sommes spécialisés dans le recrutement de profils technologiques : développeurs, ingénieurs en cybersécurité, experts en intelligence artificielle, architectes systèmes, consultants IT, et tous les métiers liés aux technologies de l\'information.'
          },
          {
            question: 'Quel est le délai moyen pour trouver un candidat ?',
            answer: 'Le délai varie selon le profil recherché et la rareté des compétences. En moyenne, nous présentons les premiers candidats qualifiés sous 7 à 14 jours après la validation de votre besoin.'
          },
          {
            question: 'Quelle est votre zone d\'intervention ?',
            answer: 'Nous intervenons principalement en France, mais notre réseau s\'étend également à l\'international pour répondre aux besoins des entreprises en croissance qui recherchent des talents à l\'échelle mondiale.'
          }
        ]
      },
      {
        icon: Shield,
        title: 'Données et Confidentialité',
        questions: [
          {
            question: 'Mes données sont-elles sécurisées ?',
            answer: 'Oui, nous mettons en œuvre des mesures de sécurité avancées pour protéger vos données personnelles. Vos informations sont chiffrées et stockées de manière sécurisée. Consultez notre politique de confidentialité pour plus de détails.'
          },
          {
            question: 'Qui a accès à mes données ?',
            answer: 'Vos données sont accessibles uniquement à notre équipe interne et à nos partenaires CRM (Boom Manager) pour la gestion de vos candidatures. Nous ne vendons jamais vos données à des tiers.'
          },
          {
            question: 'Puis-je supprimer mon compte et mes données ?',
            answer: 'Oui, vous pouvez demander la suppression de votre compte et de vos données à tout moment en nous contactant à contact@sil-talents-tech.com. Nous traiterons votre demande dans les meilleurs délais.'
          }
        ]
      },
      {
        icon: MessageCircle,
        title: 'Général',
        questions: [
          {
            question: 'Comment puis-je vous contacter ?',
            answer: 'Vous pouvez nous contacter par email à contact@sil-talents-tech.com, via notre formulaire de contact sur le site, ou par téléphone. Notre équipe est disponible pour répondre à toutes vos questions.'
          },
          {
            question: 'Quelle est votre politique de remboursement ?',
            answer: 'Nos services sont gratuits pour les candidats. Pour les entreprises, les conditions commerciales sont définies dans le contrat de prestation. Contactez-nous pour plus d\'informations.'
          },
          {
            question: 'Proposez-vous des services de conseil en recrutement ?',
            answer: 'Oui, en plus du recrutement, nous proposons des services de conseil en stratégie de recrutement, optimisation des processus de sélection, et accompagnement dans la construction d\'équipes technologiques performantes.'
          }
        ]
      }
    ]
  },
  EN: {
    pageTitle: 'Frequently Asked Questions',
    introParagraph: 'Quickly find answers to the most common questions about our technology recruitment services.',
    categories: [
      {
        icon: UserCheck,
        title: 'Candidates',
        questions: [
          {
            question: 'How can I apply for a job offer?',
            answer: 'You can apply in two ways: by creating a candidate account on our platform and applying directly to offers that interest you, or by submitting a quick application with your CV. In both cases, our team will review your profile and contact you if your profile matches our opportunities.'
          },
          {
            question: 'Do I have to pay to use your services?',
            answer: 'No, our services are completely free for candidates. Sil Talents Tech is paid by recruiting companies, never by candidates.'
          },
          {
            question: 'How can I update my profile?',
            answer: 'Once logged into your candidate account, you can access your dashboard and modify your personal information, CV, skills and preferences at any time.'
          },
          {
            question: 'How long does it take to be contacted after an application?',
            answer: 'We strive to respond to all applications within 5 to 7 business days. If your profile matches an opportunity, our team will contact you by email or phone.'
          },
          {
            question: 'Can I apply to multiple offers at the same time?',
            answer: 'Yes, you can apply to as many offers as you want. Each application is processed independently and you can track the status of your applications from your dashboard.'
          }
        ]
      },
      {
        icon: Briefcase,
        title: 'Companies',
        questions: [
          {
            question: 'How does your recruitment service work?',
            answer: 'We analyze your recruitment needs, search and pre-qualify candidates matching your criteria, then present you with the best profiles. You choose the candidates you want to meet and we organize the interviews.'
          },
          {
            question: 'What types of profiles do you recruit?',
            answer: 'We specialize in recruiting technology profiles: developers, cybersecurity engineers, artificial intelligence experts, systems architects, IT consultants, and all jobs related to information technology.'
          },
          {
            question: 'What is the average time to find a candidate?',
            answer: 'The time varies depending on the profile sought and the rarity of skills. On average, we present the first qualified candidates within 7 to 14 days after validating your need.'
          },
          {
            question: 'What is your area of operation?',
            answer: 'We operate mainly in France, but our network also extends internationally to meet the needs of growing companies looking for talent on a global scale.'
          }
        ]
      },
      {
        icon: Shield,
        title: 'Data and Privacy',
        questions: [
          {
            question: 'Is my data secure?',
            answer: 'Yes, we implement advanced security measures to protect your personal data. Your information is encrypted and stored securely. See our privacy policy for more details.'
          },
          {
            question: 'Who has access to my data?',
            answer: 'Your data is accessible only to our internal team and our CRM partners (Boom Manager) for managing your applications. We never sell your data to third parties.'
          },
          {
            question: 'Can I delete my account and my data?',
            answer: 'Yes, you can request deletion of your account and data at any time by contacting us at contact@sil-talents-tech.com. We will process your request as soon as possible.'
          }
        ]
      },
      {
        icon: MessageCircle,
        title: 'General',
        questions: [
          {
            question: 'How can I contact you?',
            answer: 'You can contact us by email at contact@sil-talents-tech.com, via our contact form on the site, or by phone. Our team is available to answer all your questions.'
          },
          {
            question: 'What is your refund policy?',
            answer: 'Our services are free for candidates. For companies, commercial conditions are defined in the service contract. Contact us for more information.'
          },
          {
            question: 'Do you offer recruitment consulting services?',
            answer: 'Yes, in addition to recruitment, we offer consulting services in recruitment strategy, optimization of selection processes, and support in building high-performing technology teams.'
          }
        ]
      }
    ]
  }
}

export default function FaqsPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [openCategory, setOpenCategory] = useState<number | null>(0)
  const [openQuestion, setOpenQuestion] = useState<{ category: number; question: number } | null>(null)

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index)
  }

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = { category: categoryIndex, question: questionIndex }
    if (openQuestion?.category === categoryIndex && openQuestion?.question === questionIndex) {
      setOpenQuestion(null)
    } else {
      setOpenQuestion(key)
    }
  }

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

          {/* Catégories */}
          <div className="space-y-4 md:space-y-6">
            {t.categories.map((category, categoryIndex) => {
              const IconComponent = category.icon
              const isCategoryOpen = openCategory === categoryIndex
              
              return (
                <motion.div
                  key={categoryIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
                  className="bg-[#0000006B] backdrop-blur-sm overflow-hidden"
                >
                  {/* En-tête de catégorie */}
                  <button
                    onClick={() => toggleCategory(categoryIndex)}
                    className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-[#00000080] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-[#297BFF] flex-shrink-0" strokeWidth={1} />
                      <h2
                        className="text-white"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 300,
                          fontSize: 'clamp(18px, 2.5vw, 24px)',
                        }}
                      >
                        {category.title}
                      </h2>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 md:w-6 md:h-6 text-[#297BFF] transition-transform duration-300 flex-shrink-0 ${
                        isCategoryOpen ? 'rotate-180' : ''
                      }`}
                      strokeWidth={1}
                    />
                  </button>

                  {/* Questions */}
                  {isCategoryOpen && (
                    <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-3">
                      {category.questions.map((item, questionIndex) => {
                        const isQuestionOpen = 
                          openQuestion?.category === categoryIndex && 
                          openQuestion?.question === questionIndex
                        
                        return (
                          <div
                            key={questionIndex}
                            className="border-l-2 border-[#297BFF]/30 pl-4"
                          >
                            <button
                              onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                              className="w-full text-left flex items-start justify-between gap-4 py-3 hover:text-[#297BFF] transition-colors"
                            >
                              <span
                                className="text-white flex-1"
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                                }}
                              >
                                {item.question}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-[#297BFF] transition-transform duration-300 flex-shrink-0 mt-1 ${
                                  isQuestionOpen ? 'rotate-180' : ''
                                }`}
                                strokeWidth={1}
                              />
                            </button>
                            {isQuestionOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="pb-3"
                              >
                                <p
                                  className="text-[#999999]"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 200,
                                    fontSize: 'clamp(13px, 1.6vw, 16px)',
                                    lineHeight: '24px',
                                  }}
                                >
                                  {item.answer}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Lien contact */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-8 md:mt-12 text-center"
          >
            <p
              className="text-[#999999] mb-2"
              style={{
                fontFamily: 'Inter',
                fontWeight: 200,
                fontSize: '16px',
              }}
            >
              {lang === 'FR' 
                ? 'Vous ne trouvez pas la réponse à votre question ?' 
                : 'Can\'t find the answer to your question?'}
            </p>
            <a
              href="/contact"
              className="inline-block text-[#297BFF] hover:text-[#1f63d6] transition-colors"
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '16px',
              }}
            >
              {lang === 'FR' ? 'Contactez-nous →' : 'Contact us →'}
            </a>
          </motion.div>
        </div>

        {/* Gradient de transition */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
      </section>
    </div>
  )
}









