import type { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: 'Sil Talents Tech - Votre croissance technologique mérite les meilleurs talents',
  description: 'Cabinet de recrutement spécialisé en Cyber, IA, Réseaux et Conseil IT. Nous accompagnons les ETI, grandes structures et scale-ups internationales.',
  keywords: 'recrutement tech, cybersécurité, intelligence artificielle, réseaux, conseil IT',
  authors: [{ name: 'Sil Talents Tech' }],
  openGraph: {
    title: 'Sil Talents Tech',
    description: 'Votre croissance technologique mérite les meilleurs talents',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}



