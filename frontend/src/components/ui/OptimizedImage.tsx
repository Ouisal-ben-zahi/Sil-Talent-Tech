'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  fill?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
  onError?: () => void
}

/**
 * Composant Image optimisé avec lazy loading et gestion d'erreurs
 * Améliore les performances et l'accessibilité
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fill = false,
  sizes,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    // Fallback vers une image par défaut si disponible
    if (imageSrc !== '/assets/Images/placeholder.png') {
      setImageSrc('/assets/Images/placeholder.png')
    }
    onError?.()
  }, [imageSrc, onError])

  if (hasError && imageSrc === '/assets/Images/placeholder.png') {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '100%' }}
        role="img"
        aria-label={alt}
      >
        <span className="text-gray-400 text-sm">Image non disponible</span>
      </div>
    )
  }

  const imageProps = fill
    ? {
        fill: true,
        sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        style: { objectFit },
      }
    : {
        width: width || 800,
        height: height || 600,
      }

  return (
    <div className={`relative ${className}`} style={fill ? { width: '100%', height: '100%' } : undefined}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        {...imageProps}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
}




