'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFloatingButtons } from '@/context/FloatingButtonsContext'

export function FloatingButtonsToggle() {
  const { areButtonsVisible, toggleButtons } = useFloatingButtons()

  return (
    <motion.button
      onClick={toggleButtons}
      className="fixed bottom-10 right-0 z-[9997] bg-transparent flex items-center justify-center group w-12 h-12 md:w-14 md:h-14 p-2 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.2,
      }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Cercle animé en arrière-plan pour attirer l'attention */}
      {!areButtonsVisible && (
        <motion.div
          className="absolute inset-0 "
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      {/* Effet de glow pulsant */}
      <motion.div
        className="absolute inset-0  "
        animate={{
          opacity: areButtonsVisible ? 0 : [0.2, 0.4, 0.2],
          scale: areButtonsVisible ? 1 : [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <AnimatePresence mode="wait">
        {areButtonsVisible ? (
          <motion.div
            key="chevron-right"
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: [1, 1.1, 1],
            }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ 
              duration: 0.2,
              scale: {
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
              }
            }}
            className="z-10 relative"
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-[#297BFF] drop-shadow-lg" />
          </motion.div>
        ) : (
          <motion.div
            key="chevron-left"
            initial={{ opacity: 0, x: 10 }}
            animate={{ 
              opacity: 1, 
              x: [0, -5, 0],
              scale: [1, 1.15, 1],
            }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ 
              opacity: { duration: 0.2 },
              scale: {
                duration: 1.2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              },
              x: {
                duration: 1.2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }
            }}
            className="z-10 relative"
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 text-[#297BFF] drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Effet de brillance qui traverse */}
      {!areButtonsVisible && (
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'linear',
            }}
          />
        </motion.div>
      )}
    </motion.button>
  )
}

