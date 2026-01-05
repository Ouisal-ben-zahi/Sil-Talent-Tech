'use client'

import { useState, useEffect, useRef } from 'react'

interface AdvantagesCarouselProps {
  advantages: string[]
}

export function AdvantagesCarousel({ advantages }: AdvantagesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll
  useEffect(() => {
    if (advantages.length <= 1) return

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isHovered) {
          setCurrentIndex((prev) => (prev + 1) % advantages.length)
        }
      }, 4000) // Scroll automatique toutes les 4 secondes
    }

    startAutoScroll()

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [advantages.length, isHovered])

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll automatique vers la carte actuelle
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cardWidth = container.offsetWidth
      container.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      })
    }
  }, [currentIndex])

  // Détecter le scroll manuel pour mettre à jour l'index
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const cardWidth = container.offsetWidth
      const scrollLeft = container.scrollLeft
      const newIndex = Math.round(scrollLeft / cardWidth)
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < advantages.length) {
        setCurrentIndex(newIndex)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentIndex, advantages.length])

  return (
    <div
      className="md:hidden relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container avec scroll horizontal */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory" 
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex gap-6">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="min-w-full flex-shrink-0 snap-center px-2"
            >
              <div className="group/card relative">
                {/* Ligne d'accent verticale à gauche */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#297BFF]/20 group-hover/card:bg-[#297BFF] transition-all duration-500" />
                
                {/* Contenu */}
                <div className="pl-6 py-4">
                  <p
                    className="transition-all duration-500 group-hover/card:text-white"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300,
                      fontSize: '16px',
                      lineHeight: '26px',
                      color: '#D9D9D9',
                    }}
                  >
                    {advantage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicators */}
      {advantages.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {advantages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#297BFF] w-8'
                  : 'bg-[#297BFF]/30 hover:bg-[#297BFF]/50 w-2'
              }`}
              aria-label={`Aller à l'avantage ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

