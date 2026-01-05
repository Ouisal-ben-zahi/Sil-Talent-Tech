'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Sector {
  title: string
  description: string
}

interface SectorsCarouselSimpleProps {
  sectors: Sector[]
}

export function SectorsCarouselSimple({ sectors }: SectorsCarouselSimpleProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardsPerView = 3
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const maxIndex = Math.max(0, sectors.length - cardsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const getVisibleSectors = () => {
    return sectors.slice(currentIndex, currentIndex + cardsPerView)
  }

  // Auto-scroll Desktop
  useEffect(() => {
    if (sectors.length <= cardsPerView) return

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isHovered) {
          setCurrentIndex((prev) => {
            if (prev >= maxIndex) {
              return 0 // Retour au début
            }
            return prev + 1
          })
        }
      }, 5000) // Scroll automatique toutes les 5 secondes
    }

    startAutoScroll()

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [sectors.length, maxIndex, isHovered])


  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile : toutes les cartes sur une ligne avec scroll horizontal, chaque carte prend 90% width */}
      <div className="md:hidden overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-4 px-4">
          {sectors.map((sector, index) => (
            <div
              key={index}
              className="group relative flex-shrink-0"
              style={{ width: '90%' }}
            >
              <div className="bg-black/50 p-5 transition-all duration-500 hover:bg-black/70 h-full flex flex-col">
                {/* Titre */}
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 300,
                    fontSize: '16px',
                    color: '#FFFFFF',
                  }}
                >
                  {sector.title}
                </h3>
                
                {/* Description avec retour à la ligne */}
                <p
                  className="whitespace-normal break-words"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 100,
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: '#999999',
                  }}
                >
                  {sector.description}
                </p>
                
                {/* Ligne de fond animée au hover */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#297BFF] transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop : 3 cartes avec flèches */}
      <div className="hidden md:block">
        <div className="flex items-center gap-4 relative">
          {/* Flèche gauche - à gauche de la première carte */}
          {currentIndex > 0 && (
            <button
              onClick={prevSlide}
              className="flex-shrink-0 p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
              aria-label="Secteur précédent"
              style={{ transition: 'opacity 0.3s ease' }}
            >
              <ChevronLeft className="w-8 h-8" style={{ color: '#297BFF' }} />
            </button>
          )}

          {/* Cards Grid */}
          <div className="flex-1 grid grid-cols-3 gap-5">
            {getVisibleSectors().map((sector, index) => (
              <div
                key={`${currentIndex}-${index}`}
                className="group/card relative bg-black/50 p-6 transition-all duration-500 hover:bg-black/70 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4),0_0_20px_rgba(41,123,255,0.15)]"
                style={{
                  animation: 'fadeIn 0.5s ease-in-out',
                }}
              >
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 300,
                    fontSize: '18px',
                    color: '#FFFFFF',
                  }}
                >
                  {sector.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 100,
                    fontSize: '16px',
                    lineHeight: '22px',
                    color: '#999999',
                  }}
                >
                  {sector.description}
                </p>
                {/* Ligne de fond animée au hover */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#297BFF] transition-all duration-500 group-hover/card:w-full" />
              </div>
            ))}
          </div>

          {/* Flèche droite - à droite de la dernière carte */}
          {currentIndex < maxIndex && (
            <button
              onClick={nextSlide}
              className="flex-shrink-0 p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
              aria-label="Secteur suivant"
              style={{ transition: 'opacity 0.3s ease' }}
            >
              <ChevronRight className="w-8 h-8" style={{ color: '#297BFF' }} />
            </button>
          )}
        </div>

        {/* Dots Indicators Desktop */}
        {sectors.length > cardsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#297BFF] w-8'
                    : 'bg-[#297BFF]/30 hover:bg-[#297BFF]/50 w-2'
                }`}
                aria-label={`Aller à la position ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

