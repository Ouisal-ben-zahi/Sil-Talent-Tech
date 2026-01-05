'use client'

import { Toaster, ToastBar, toast } from 'react-hot-toast'
import { CheckCircle, XCircle, Info, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      containerClassName="!z-[9999]"
      containerStyle={{
        top: 24,
        right: 24,
      }}
      gutter={16}
      toastOptions={{
        duration: 4500,
        style: {
          background: 'transparent',
          border: 'none',
          borderRadius: '0px',
          padding: 0,
          boxShadow: 'none',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => {
            const getToastConfig = () => {
              switch (t.type) {
                case 'success':
                  return {
                    bg: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%)',
                    border: '1px solid rgba(41, 123, 255, 0.5)',
                    glow: '0 0 30px rgba(41, 123, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)',
                    iconColor: '#297BFF',
                    accentColor: '#297BFF',
                    icon: <CheckCircle className="w-6 h-6" />,
                  }
                case 'error':
                  return {
                    bg: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    glow: '0 0 30px rgba(239, 68, 68, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)',
                    iconColor: '#EF4444',
                    accentColor: '#EF4444',
                    icon: <XCircle className="w-6 h-6" />,
                  }
                case 'loading':
                  return {
                    bg: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%)',
                    border: '1px solid rgba(41, 123, 255, 0.3)',
                    glow: '0 0 20px rgba(41, 123, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5)',
                    iconColor: '#297BFF',
                    accentColor: '#297BFF',
                    icon: (
                      <div className="relative w-6 h-6">
                        <div className="absolute inset-0 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#297BFF' }} />
                        <div className="absolute inset-1 border-2 border-r-transparent rounded-full animate-spin" style={{ borderColor: '#297BFF', animationDirection: 'reverse', animationDuration: '0.8s' }} />
                      </div>
                    ),
                  }
                default:
                  return {
                    bg: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%)',
                    border: '1px solid rgba(123, 123, 123, 0.3)',
                    glow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    iconColor: '#7B7B7B',
                    accentColor: '#7B7B7B',
                    icon: icon || <Info className="w-6 h-6" />,
                  }
              }
            }

            const config = getToastConfig()

            return (
              <AnimatePresence mode="wait">
                <motion.div
                  key={t.id}
                  initial={{ 
                    opacity: 0, 
                    x: 100,
                    scale: 0.8,
                    filter: 'blur(10px)',
                  }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 100,
                    scale: 0.8,
                    filter: 'blur(10px)',
                  }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="relative overflow-hidden group"
                  style={{
                    background: config.bg,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: config.border,
                    borderRadius: '0px',
                    boxShadow: config.glow,
                    minWidth: '340px',
                    maxWidth: '450px',
                    borderLeft: `4px solid ${config.accentColor}`,
                  }}
                >
                  {/* Effet de brillance animé */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)`,
                    }}
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: 'linear',
                    }}
                  />

                  {/* Barre de progression animée */}
                  {t.type !== 'loading' && (
                    <motion.div
                      className="absolute top-0 left-0 h-1 z-10"
                      style={{
                        background: `linear-gradient(90deg, ${config.accentColor}, ${config.accentColor}80)`,
                        boxShadow: `0 0 10px ${config.accentColor}`,
                      }}
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{
                        duration: (t.duration || 4500) / 1000,
                        ease: 'linear',
                      }}
                    />
                  )}

                  {/* Contenu principal */}
                  <div className="flex items-start gap-4 p-5 relative z-10">
                    {/* Icône avec effet de pulse */}
                    <motion.div
                      className="flex-shrink-0"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                    >
                      <motion.div
                        className="relative"
                        style={{ color: config.iconColor }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        {config.icon}
                        {/* Effet de glow autour de l'icône */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: config.accentColor,
                            opacity: 0.2,
                            filter: 'blur(8px)',
                          }}
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      </motion.div>
                    </motion.div>

                    {/* Message avec animation de texte */}
                    <motion.div
                      className="flex-1 min-w-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 300,
                          fontSize: '15px',
                          color: '#FFFFFF',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {typeof message === 'string' ? message : message}
                      </p>
                    </motion.div>

                    {/* Bouton de fermeture avec animation */}
                    {t.type !== 'loading' && (
                      <motion.button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-shrink-0 p-1.5 rounded-none hover:bg-white/10 transition-all duration-200 group/close"
                        aria-label="Fermer"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <X 
                          className="w-4 h-4 transition-colors duration-200" 
                          style={{ color: '#999999' }}
                        />
                      </motion.button>
                    )}
                  </div>

                  {/* Ligne d'accent en bas */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5"
                    style={{
                      background: `linear-gradient(90deg, ${config.accentColor}, transparent)`,
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: 'easeOut',
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            )
          }}
        </ToastBar>
      )}
    </Toaster>
  )
}

