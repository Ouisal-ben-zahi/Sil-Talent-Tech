'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

// Transition ultra-rapide pour les changements de page
const pageVariants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.2, // Très rapide : 200ms
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15, // Encore plus rapide à la sortie : 150ms
      ease: 'easeIn',
    },
  },
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ willChange: 'opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
















