import type { Metadata } from 'next'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'

export const metadata: Metadata = {
  title: 'Sil Talents Tech - Votre croissance technologique mérite les meilleurs talents',
  description: 'Cabinet de recrutement spécialisé en Cyber, IA, Réseaux et Conseil IT. Nous accompagnons les ETI, grandes structures et scale-ups internationales.',
  keywords: 'recrutement tech, cybersécurité, intelligence artificielle, réseaux, conseil IT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head />
      <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

