'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'

interface LightBlobsProps {
  variant?: 'global' | 'hero' | 'section'
}

export const LightBlobs = memo(function LightBlobs({ variant = 'global' }: LightBlobsProps) {
  if (variant === 'hero') {
    return (
      <>
        {/* Blob Hero 1 - Top Left sur image */}
        <motion.div
          className="absolute rounded-full blur-3xl z-[2]"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
            top: '10%',
            left: '5%',
            opacity: 0.9,
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Blob Hero 2 - Top Right sur image */}
        <motion.div
          className="absolute rounded-full blur-3xl z-[2]"
          style={{
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%)',
            top: '15%',
            right: '8%',
            opacity: 0.85,
          }}
          animate={{
            x: [0, -25, 0],
            y: [0, 35, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Blob Hero 3 - Center Left sur image */}
        <motion.div
          className="absolute rounded-full blur-3xl z-[2]"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
            top: '40%',
            left: '-100px',
            opacity: 0.8,
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -25, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Blob Hero 4 - Center Right sur image */}
        <motion.div
          className="absolute rounded-full blur-3xl z-[2]"
          style={{
            width: '550px',
            height: '550px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
            top: '50%',
            right: '-80px',
            opacity: 0.75,
          }}
          animate={{
            x: [0, -35, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Blob Hero 5 - Bottom Center sur image */}
        <motion.div
          className="absolute rounded-full blur-3xl z-[2]"
          style={{
            width: '650px',
            height: '650px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0.7,
          }}
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.7, 0.85, 0.7],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </>
    )
  }

  if (variant === 'section') {
    return (
      <>
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
            top: '10%',
            left: '-200px',
            opacity: 0.7,
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)',
            top: '50%',
            right: '-150px',
            opacity: 0.65,
          }}
          animate={{
            x: [0, -35, 0],
            y: [0, -25, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </>
    )
  }

  // Global blobs
  return (
    <>
      {/* Blob 1 - Top Left */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
          top: '-200px',
          left: '-200px',
          opacity: 0.8,
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Blob 2 - Top Right */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%)',
          top: '-150px',
          right: '-150px',
          opacity: 0.7,
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Blob 3 - Center Right */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
          top: '30%',
          right: '-250px',
          opacity: 0.65,
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Blob 4 - Bottom Left */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
          bottom: '-200px',
          left: '-150px',
          opacity: 0.6,
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Blob 5 - Center */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.5,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.65, 0.5],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Blob 6 - Bottom Right */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
          bottom: '-100px',
          right: '10%',
          opacity: 0.65,
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Blob 7 - Section Expertise */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
          top: '60%',
          left: '-150px',
          opacity: 0.6,
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Blob 8 - Section Pourquoi Nous Choisir */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
          top: '80%',
          right: '-200px',
          opacity: 0.6,
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </>
  )
})


