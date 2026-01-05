import type { Metadata } from 'next'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sil-talents-tech.com'),
  title: {
    default: 'Sil Talents Tech - Votre croissance technologique mérite les meilleurs talents',
    template: '%s | Sil Talents Tech'
  },
  description: 'Cabinet de recrutement spécialisé en Cyber, IA, Réseaux et Conseil IT. Nous accompagnons les ETI, grandes structures et scale-ups internationales.',
  keywords: ['recrutement tech', 'cybersécurité', 'intelligence artificielle', 'réseaux', 'conseil IT', 'recrutement informatique', 'talents technologiques'],
  authors: [{ name: 'Sil Talents Tech' }],
  creator: 'Sil Talents Tech',
  publisher: 'Sil Talents Tech',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'Sil Talents Tech',
    title: 'Sil Talents Tech - Votre croissance technologique mérite les meilleurs talents',
    description: 'Cabinet de recrutement spécialisé en Cyber, IA, Réseaux et Conseil IT.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sil Talents Tech',
    description: 'Cabinet de recrutement spécialisé en Cyber, IA, Réseaux et Conseil IT.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Ajoutez vos codes de vérification ici si nécessaire
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* Preconnect pour améliorer les performances */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://168.231.82.55:3001'} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || 'http://168.231.82.55:3001'} />
        
        {/* Preload des fonts critiques uniquement (Regular et Medium pour la plupart du contenu) */}
        <link
          rel="preload"
          href="/fonts/Inter-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Inter-Medium.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Inter-SemiBold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

