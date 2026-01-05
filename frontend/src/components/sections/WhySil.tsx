'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const translations = {
  FR: {
    sectionTitle: 'Pourquoi Sil Talents Tech ?',
    mainTitle: 'Une approche humaine, une maîtrise technologique',
    description: "Nous sommes plus qu'un prestataire : un véritable partenaire stratégique. Grâce à notre double expertise en RH et en tech, nous comprenons vos enjeux métiers, vos contraintes opérationnelles et votre besoin de fiabilité.",
    cards: [
  {
    title: 'Expertise doublee :',
    subtitle: 'humaine & technologique',
    description:
      "Nous combinons les compétences d'un cabinet de recrutement spécialisé avec celles d'une société de services numériques. Recruter, conseiller, sécuriser, automatiser.",
    cta: 'Découvrir Nos Expertises',
    href: '/a-propos',
  },
  {
    title: 'Réactivité',
    subtitle: 'opérationnelle',
    description:
      'Grâce à notre vivier de talents qualifiés et à notre organisation agile, nous sommes capables de proposer des profils en 48h.',
    cta: 'Demander Un Profil',
    href: '/entreprise/formulaire',
  },
  {
    title: 'Accompagnement',
    subtitle: 'sur mesure',
    description:
      'Chaque client est unique. Nos solutions sont personnalisées selon votre secteur, vos enjeux et vos équipes. Nos consultants adaptent leur approche avec transparence et agilité.',
    cta: 'Planifier Un Échange',
    href: '/entreprise/formulaire',
  },
  {
    title: "Culture de l'exigence",
    subtitle: 'et du résultat',
    description:
      'Nos consultants sont sélectionnés pour leur technicité, leur rigueur et leur sens du service. Chaque mission est pilotée pour garantir performance, qualité et retour sur investissement.',
    cta: 'Consulter Nos Références',
    href: '/a-propos',
  },
    ],
  },
  EN: {
    sectionTitle: 'Why Sil Talents Tech?',
    mainTitle: 'A human approach, technological mastery',
    description: 'We are more than a service provider: a true strategic partner. Thanks to our dual expertise in HR and tech, we understand your business challenges, operational constraints, and need for reliability.',
    cards: [
      {
        title: 'Dual Expertise:',
        subtitle: 'human & technological',
        description:
          "We combine the skills of a specialized recruitment firm with those of a digital services company. Recruit, advise, secure, automate.",
        cta: 'Discover Our Expertise',
        href: '/a-propos',
      },
      {
        title: 'Operational',
        subtitle: 'reactivity',
        description:
          'Thanks to our pool of qualified talent and agile organization, we can propose profiles within 48 hours.',
        cta: 'Request A Profile',
        href: '/entreprise/formulaire',
      },
      {
        title: 'Customized',
        subtitle: 'support',
        description:
          'Each client is unique. Our solutions are personalized according to your sector, challenges, and teams. Our consultants adapt their approach with transparency and agility.',
        cta: 'Schedule A Meeting',
        href: '/entreprise/formulaire',
      },
      {
        title: 'Culture of excellence',
        subtitle: 'and results',
        description:
          'Our consultants are selected for their technical skills, rigor, and service mindset. Each mission is managed to guarantee performance, quality, and return on investment.',
        cta: 'View Our References',
        href: '/a-propos',
      },
    ],
  },
}

export function WhySil() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <section className="relative text-white overflow-hidden py-24 md:py-28 flex justify-center items-center">
      {/* Background image pleine section avec le même overlay que la Hero section */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/Images/ImgHero.jpg"
          alt="Background texture"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay sombre identique à la Hero section */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
        {/* Gradient supplémentaire en haut (~30% de la hauteur) */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: '30%',
            background: 'linear-gradient(to bottom, #1A1A1A, transparent)',
          }}
        />
        {/* Gradient supplémentaire en bas (~30% de la hauteur) */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '30%',
            background: 'linear-gradient(to top, #1A1A1A, transparent)',
          }}
        />
      </div>

      {/* Content container */}
      <div className="relative w-full max-w-6xl px-4 md:text-center">
        <p
          className="mb-4 tracking-[0.18em] text-[#B3B3B3] text-left md:text-center"
          style={{
            fontFamily: 'Inter',
            fontWeight: 200,
            fontStyle: 'normal',
            fontSize: '16px',
            color:'#ffffff ',
          }}
        >
            {t.sectionTitle}
        </p>
        <h2
          className="mb-6 text-white leading-tight text-left md:text-center"
          style={{
            fontFamily: 'Inter',
            fontWeight: 300,
            fontStyle: 'normal',
            fontSize: 'clamp(28px, 5vw, 48px)',
          }}
        >
          {t.mainTitle}
          </h2>
        <p
          className="mx-auto mb-12 max-w-5xl text-[#D9D9D9] text-left md:text-center"
          style={{
            fontFamily: 'Inter',
            fontWeight: 200,
            fontStyle: 'normal',
            fontSize: '18px',
            color:'#999999 ',
          }}
        >
          {t.description}
        </p>

        {/* Cards - Mobile : horizontal scroll avec scroll snap */}
        <div
          className="md:hidden flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 pt-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {t.cards.map((card, index) => (
            <div
              key={index}
              className="min-w-[85%] snap-center relative bg-[#0000006B] border border-[#99999924] px-8 py-10 rounded-none flex flex-col items-start text-left transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
            >
              <h3
                className="mb-2 text-white text-left"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 200,
                  fontStyle: 'normal',
                  fontSize: '24px',
                  minHeight: '32px',
                }}
              >
                {card.title}
              </h3>
              <h3
                className="mb-4 text-white text-left"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontStyle: 'normal',
                  fontSize: '24px',
                  minHeight: '32px',
                }}
              >
                {card.subtitle}
              </h3>
              <p
                className="mb-6 flex-grow text-[#D9D9D9] text-left"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 200,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  lineHeight: '28px',
                  letterSpacing: '0',
                  color: '#999999',
                  minHeight: '140px',
                }}
              >
                {card.description}
              </p>
              <Link
                href={card.href || '#'}
                className="px-6 py-4 bg-[#297BFF] hover:bg-[#1f63d6] transition-colors text-white mt-auto inline-block text-left"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 200,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  textTransform: 'capitalize',
                }}
              >
                {card.cta}
              </Link>
            </div>
          ))}
        </div>


        {/* Cards - Desktop : grille 2x2 classique */}
        <div className="hidden md:grid grid-cols-2 gap-6 md:gap-8">
          {t.cards.map((card, index) => (
            <div
              key={index}
              className="relative bg-[#0000006B] border border-[#99999924] px-12 py-12 text-left flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
            >
              <h3
                className="mb-1 text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontStyle: 'normal',
                  fontSize: '32px',
                  textAlign: 'left',
                  minHeight: '40px',
                }}
              >
                {card.title}
              </h3>
              <h3
                className="mb-4 text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontStyle: 'normal',
                  fontSize: '32px',
                  textAlign: 'left',
                  minHeight: '40px',
                }}
              >
                {card.subtitle}
              </h3>
              <p
                className="mb-8 flex-grow text-[#D9D9D9]"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 200,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0',
                  color: '#999999',
                  textAlign: 'left',
                  minHeight: '140px',
                }}
              >
                {card.description}
              </p>
              <Link
                href={card.href || '#'}
                className="px-6 py-2 bg-[#297BFF] hover:bg-[#1f63d6] transition-colors text-white mt-auto w-[60%] inline-block text-center"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 200,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  textTransform: 'capitalize',
                }}
              >
                {card.cta}
              </Link>
                </div>
          ))}
        </div>
      </div>
    </section>
  )
}
