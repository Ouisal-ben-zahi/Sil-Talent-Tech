'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatbot } from '@/context/ChatbotContext'
import { useFloatingButtons } from '@/context/FloatingButtonsContext'

export function WhatsAppBanner() {
  const whatsappNumber = '+212 655 682 404'
  const message = encodeURIComponent('Bonjour, je souhaite obtenir des informations sur vos services.')
  const { isOpen } = useChatbot()
  const { areButtonsVisible } = useFloatingButtons()

  if (!areButtonsVisible || isOpen) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.a
        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-[88px] md:bottom-[88px] right-[88px] md:right-[88px] z-[9998] bg-[#25D366] w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-2xl group rounded-none"
          whileHover={{ 
            scale: 1.15,
            boxShadow: '0 0 30px rgba(37, 211, 102, 0.6)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="/assets/Images/hugeicons_whatsapp-business.svg"
            alt="WhatsApp"
            width={28}
            height={28}
            className="object-contain z-10 relative"
          />
          {/* Effet de glow au hover */}
          <motion.div
            className="absolute inset-0 bg-[#25D366] opacity-0 group-hover:opacity-50"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
      </motion.a>
    </AnimatePresence>
  )
}



