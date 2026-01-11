'use client'

import Link from 'next/link'

/**
 * Composant Skip Link pour améliorer l'accessibilité
 * Permet aux utilisateurs de navigation au clavier de sauter directement au contenu principal
 */
export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#297BFF] focus:text-white focus:rounded focus:font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
    >
      Aller au contenu principal
    </Link>
  )
}




