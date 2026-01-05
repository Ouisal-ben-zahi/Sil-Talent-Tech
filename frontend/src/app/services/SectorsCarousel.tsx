'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Sector {
  title: string
  description: string
}

interface SectorsCarouselProps {
  sectors: Sector[]
}

export function SectorsCarousel({ sectors }: SectorsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sectors.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + sectors.length) % sectors.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {sectors.map((sector, index) => (
            <div
              key={index}
              className="min-w-full flex-shrink-0 px-2"
            >
              <div className="group bg-black/60 border border-[#297BFF]/30 p-8 transition-all duration-300 hover:border-[#297BFF] hover:bg-black/80 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4),0_0_20px_rgba(41,123,255,0.3)]">
                <h3
                  className="mb-4"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 300,
                    fontSize: 'clamp(20px, 2.5vw, 24px)',
                    color: '#FFFFFF',
                  }}
                >
                  {sector.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 300,
                    fontSize: '16px',
                    lineHeight: '26px',
                    color: '#D9D9D9',
                  }}
                >
                  {sector.description}
                </p>
                {/* Ligne de fond animée au hover */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#297BFF] transition-all duration-300 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Desktop */}
      <div className="hidden md:flex items-center justify-between mt-6">
        <button
          onClick={prevSlide}
          className="p-3 bg-black/60 border border-[#297BFF]/30 hover:bg-black/80 hover:border-[#297BFF] transition-all duration-300"
          aria-label="Secteur précédent"
        >
          <ChevronLeft className="w-6 h-6" style={{ color: '#297BFF' }} />
        </button>

        {/* Dots Indicators */}
        <div className="flex gap-2">
          {sectors.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#297BFF] w-8'
                  : 'bg-[#297BFF]/30 hover:bg-[#297BFF]/50'
              }`}
              aria-label={`Aller au secteur ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="p-3 bg-black/60 border border-[#297BFF]/30 hover:bg-black/80 hover:border-[#297BFF] transition-all duration-300"
          aria-label="Secteur suivant"
        >
          <ChevronRight className="w-6 h-6" style={{ color: '#297BFF' }} />
        </button>
      </div>

      {/* Mobile: Scroll horizontal avec snap */}
      <div className="md:hidden mt-6 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
        {sectors.map((sector, index) => (
          <div
            key={index}
            className="min-w-[85%] snap-center flex-shrink-0"
          >
            <div className="bg-black/60 border border-[#297BFF]/30 p-6 transition-all duration-300 hover:border-[#297BFF] hover:bg-black/80">
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontSize: '20px',
                  color: '#FFFFFF',
                }}
              >
                {sector.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 100,
                  fontSize: '15px',
                  lineHeight: '24px',
                  color: '#D9D9D9',
                }}
              >
                {sector.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}





