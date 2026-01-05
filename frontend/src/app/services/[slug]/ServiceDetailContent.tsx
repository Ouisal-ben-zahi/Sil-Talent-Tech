'use client'

import Image from 'next/image'
import { ServiceCtaButtons } from '../ServiceCtaButtons'
import { SectorsCarouselSimple } from '../SectorsCarouselSimple'
import { useLanguage } from '@/context/LanguageContext'
import { getServiceData } from './serviceTranslations'

const heroImagePath = '/assets/Images/hero.PNG'

// Traductions pour les textes statiques
const staticTranslations = {
  FR: {
    keyPoints: [
      'Talents sélectionnés pour leur expertise métier et technique.',
      'Process de recrutement structuré, transparent et rapide.',
      'Accompagnement des entreprises et des talents sur la durée.',
    ],
    problemsTitle: 'Problématiques que nous résolvons',
    sectorsTitle: 'Secteurs adressés',
    sectorsDescription: 'Nous intervenons dans une large gamme de secteurs d\'activité, de l\'industrie traditionnelle aux entreprises technologiques les plus innovantes. Notre expertise nous permet d\'accompagner des organisations de toutes tailles, des startups aux grands groupes internationaux.',
    deliverablesTitle: 'Profils et livrables typiques',
    whyChooseTitle: 'Pourquoi choisir Sil Talents Tech pour ce service ?',
    whyChooseDescription: 'Au-delà de la simple mise en relation, nous construisons avec vous une relation de confiance, fondée sur la compréhension de votre environnement, de vos contraintes et de vos ambitions. Chaque mission est pilotée avec un objectif clair : sécuriser vos recrutements, fluidifier vos process et créer un cadre dans lequel les talents peuvent réellement s\'épanouir.',
  },
  EN: {
    keyPoints: [
      'Talents selected for their business and technical expertise.',
      'Structured, transparent, and fast recruitment process.',
      'Long-term support for companies and talents.',
    ],
    problemsTitle: 'Problems we solve',
    sectorsTitle: 'Sectors we serve',
    sectorsDescription: 'We operate across a wide range of sectors, from traditional industry to the most innovative technology companies. Our expertise enables us to support organizations of all sizes, from startups to large international groups.',
    deliverablesTitle: 'Typical profiles and deliverables',
    whyChooseTitle: 'Why choose Sil Talents Tech for this service?',
    whyChooseDescription: 'Beyond simple matching, we build with you a relationship of trust, based on understanding your environment, constraints, and ambitions. Each mission is managed with a clear objective: secure your recruitments, streamline your processes, and create a framework where talents can truly thrive.',
  },
}

interface ServiceData {
  icon: any
  title: string
  heroTitle: string
  heroDescription: string
  presentationTitle: string
  presentationBody: string
  problems: string[]
  sectors: string[]
  sectorsDetailed: Array<{ title: string; description: string }>
  deliverables: string[]
  advantages: string[]
}

interface ServiceDetailContentProps {
  service: ServiceData
  slug: string
}

export function ServiceDetailContent({ service, slug }: ServiceDetailContentProps) {
  const { lang } = useLanguage()
  const t = staticTranslations[lang]
  // Obtenir les données traduites selon la langue
  const translatedService = getServiceData(slug, lang, service)

  return (
    <div className="min-h-screen bg-sil-dark relative pt-24">
      {/* Hero avec image de fond et overlay sombre */}
      <section
        className="relative w-full min-h-screen overflow-hidden flex items-center"
        style={{
          backgroundImage: `url(${heroImagePath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />

        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto py-16 md:py-24 text-left flex items-center">
          <div className="max-w-3xl">
            <h1
              className="mb-4 md:mb-6"
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: '#FFFFFF',
                lineHeight: '1.1',
              }}
            >
              {translatedService.heroTitle}
            </h1>
            <p
              style={{
                fontFamily: 'Inter',
                fontWeight: 200,
                fontSize: '18px',
                lineHeight: '28px',
                color: '#D9D9D9',
              }}
            >
              {translatedService.heroDescription}
            </p>

            {/* Petits points clés pour enrichir la 1ʳᵉ section */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {t.keyPoints.map((point, index) => (
                <div key={index} className="bg-black/40 border border-white/10 px-4 py-3">
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#D9D9D9',
                    }}
                  >
                    {point}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA principal directement dans la première section */}
            <div className="mt-6">
              <ServiceCtaButtons />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : contenu structuré sur fond sombre simple */}
      <section className="bg-[#1A1A1A] py-16 md:py-20 text-white">
        <div className="w-[90%] max-w-[1200px] mx-auto space-y-16 md:space-y-20">
          {/* Présentation du service */}
          <div>
            <h2
              className="mb-4 md:mb-5"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3vw, 30px)',
                color: '#FFFFFF',
              }}
            >
              {translatedService.presentationTitle}
            </h2>
            <p
              style={{
                fontFamily: 'Inter',
                fontWeight: 300,
                fontSize: '16px',
                lineHeight: '26px',
                color: '#D9D9D9',
              }}
            >
              {translatedService.presentationBody}
            </p>
          </div>

          {/* Problématiques */}
          <div>
            <h2
              className="mb-6 md:mb-8"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#FFFFFF',
              }}
            >
              {t.problemsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {translatedService.problems.map((problem, index) => (
                <div
                  key={index}
                  className="group relative bg-black/40 border-l-4 border-[#297BFF] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-black/60 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3),0_0_20px_rgba(41,123,255,0.2)]"
                >
                  {/* Numéro stylisé */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#297BFF]/20 border-2 border-[#297BFF]/50 flex items-center justify-center group-hover:bg-[#297BFF]/30 group-hover:border-[#297BFF] transition-all duration-300">
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 600,
                          fontSize: '18px',
                          color: '#297BFF',
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <p
                      className="flex-1"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '26px',
                        color: '#D9D9D9',
                      }}
                    >
                      {problem}
                    </p>
                  </div>
                  {/* Ligne de fond animée au hover */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#297BFF] transition-all duration-300 group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Section 3 : fond image type hero + Secteurs + Profils/Livrables + avantages + CTA */}
      <section className="relative text-white overflow-hidden py-20 md:py-24">
        {/* Background Image - Full Width (identique au hero de la home) */}
        <div className="absolute inset-0 z-0 w-full">
          <Image
            src="/assets/Images/ImgHero.jpg"
            alt="Fond services Sil Talents Tech"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay pour la lisibilité */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
          />
        </div>
        {/* Gradient top et bottom : 20% de la hauteur, gris foncé -> transparent */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{
            height: '20%',
            background: 'linear-gradient(to bottom, #1A1A1A, transparent)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: '20%',
            background: 'linear-gradient(to top, #1A1A1A, transparent)',
          }}
        />

        {/* Content Container - Centered, 90% width, max 1200px (identique au hero) */}
        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto space-y-14">
          {/* Secteurs adressés */}
          <div>
            <div className="mb-8">
              <h2
                className="mb-4"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  color: '#FFFFFF',
                }}
              >
                {t.sectorsTitle}
              </h2>
              <p
                className="max-w-3xl"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontSize: '16px',
                  lineHeight: '26px',
                  color: '#999999',
                }}
              >
                {t.sectorsDescription}
              </p>
            </div>
            <SectorsCarouselSimple sectors={translatedService.sectorsDetailed} />
          </div>

          {/* Profils et livrables - Timeline Design */}
          <div>
            <h2
              className="mb-8 md:mb-10"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#FFFFFF',
              }}
            >
              {t.deliverablesTitle}
            </h2>
            <div className="relative">
              {/* Ligne verticale centrée - visible sur mobile et desktop */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#297BFF]/20 via-[#297BFF]/40 to-[#297BFF]/20" />

              {/* Liste des profils/livrables avec alternance */}
              <div className="space-y-8 md:space-y-12">
                {translatedService.deliverables.map((deliverable, index) => {
                  const isEven = index % 2 === 0
                  return (
                    <div
                      key={index}
                      className="group relative flex items-start"
                    >
                      {/* Contenu à gauche (index pair) ou droite (index impair) */}
                      <div
                        className={`flex-1 transition-all duration-500 ${
                          isEven
                            ? 'pr-[calc(50%+1.5rem)] md:pr-[calc(50%+2.5rem)] text-right'
                            : 'pl-[calc(50%+1.5rem)] md:pl-[calc(50%+2.5rem)] text-left'
                        }`}
                      >
                        <div className="relative p-4 md:p-6 transition-all duration-500 hover:translate-x-2 md:hover:translate-x-0 md:hover:translate-y-[-4px]">
                          {/* Ligne de connexion vers le marqueur */}
                          <div className="absolute top-1/2 w-6 md:w-8 h-0.5 bg-[#297BFF]/20 transition-all duration-500 group-hover:bg-[#297BFF]/60 group-hover:w-8 md:group-hover:w-12"
                            style={{
                              [isEven ? 'right' : 'left']: '-1.5rem',
                              transform: 'translateY(-50%)',
                            }}
                          />
                          
                          {/* Texte avec effet hover */}
                          <p
                            className="relative transition-all duration-500 group-hover:text-[#297BFF] whitespace-normal break-words"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontSize: '15px',
                              lineHeight: '24px',
                              color: '#D9D9D9',
                            }}
                          >
                            {deliverable}
                          </p>
                          
                          {/* Ligne de soulignement animée au hover */}
                          <div 
                            className="absolute bottom-0 h-0.5 w-0 bg-[#297BFF] transition-all duration-500 group-hover:w-full"
                            style={{
                              [isEven ? 'right' : 'left']: '0',
                            }}
                          />
                        </div>
                      </div>

                      {/* Marqueur circulaire au centre avec animation - visible sur mobile et desktop */}
                      <div className="absolute left-1/2 -translate-x-1/2 z-10 flex-shrink-0">
                        <div className="relative">
                          <div className="w-4 h-4 md:w-5 md:h-5 bg-[#297BFF] border-4 border-[#1A1A1A] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(41,123,255,0.8)] md:group-hover:shadow-[0_0_20px_rgba(41,123,255,0.8)]" />
                          {/* Cercle externe animé au hover */}
                          <div className="absolute inset-0 w-4 h-4 md:w-5 md:h-5 border-2 border-[#297BFF]/0 rounded-full transition-all duration-500 group-hover:border-[#297BFF]/50 group-hover:scale-150" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Pourquoi nous choisir + avantages */}
          <div>
            <h2
              className="mb-4 md:mb-5"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#FFFFFF',
              }}
            >
              {t.whyChooseTitle}
            </h2>
            <p
              className="mb-12 max-w-3xl"
              style={{
                fontFamily: 'Inter',
                fontWeight: 300,
                fontSize: '16px',
                lineHeight: '26px',
                color: '#D9D9D9',
              }}
            >
              {t.whyChooseDescription}
            </p>

            {/* Design épuré et moderne pour site tech */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {translatedService.advantages.map((advantage, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  {/* Ligne d'accent verticale à gauche */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#297BFF]/20 group-hover:bg-[#297BFF] transition-all duration-500" />
                  
                  {/* Contenu */}
                  <div className="pl-6 md:pl-8 py-4">
                    {/* Texte principal */}
                    <p
                      className="transition-all duration-500 group-hover:text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 300,
                        fontSize: '16px',
                        lineHeight: '26px',
                        color: '#D9D9D9',
                      }}
                    >
                      {advantage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}

