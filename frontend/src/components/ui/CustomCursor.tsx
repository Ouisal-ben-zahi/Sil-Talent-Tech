'use client'

import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Détecter si c'est un appareil mobile/tactile
    const checkMobile = () => {
      setIsMobile(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      )
    }

    checkMobile()

    // Ne pas activer le curseur personnalisé sur mobile
    if (isMobile) return

    // Masquer le curseur si la souris quitte la fenêtre
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    // Détecter les éléments interactifs
    const checkInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.closest('[role="button"]') !== null ||
        target.closest('[onclick]') !== null ||
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.classList.contains('cursor-pointer') ||
        target.style.cursor === 'pointer'

      setIsHovering(isInteractive)
    }

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseover', checkInteractive, true)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseover', checkInteractive, true)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isMobile])

  // Ne pas afficher le curseur personnalisé sur mobile
  if (isMobile || !isVisible) return null

  return (
    <>
      {/* Curseur principal */}
      <div
        className="fixed pointer-events-none z-[9999] transition-transform duration-300 ease-out"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : isHovering ? 1.5 : 1})`,
        }}
      >
        <div
          className="rounded-full border-2 transition-all duration-300"
          style={{
            width: isHovering ? '40px' : '20px',
            height: isHovering ? '40px' : '20px',
            borderColor: '#297BFF',
            backgroundColor: isHovering ? 'rgba(41, 123, 255, 0.1)' : 'transparent',
            boxShadow: isClicking
              ? '0 0 0 4px rgba(41, 123, 255, 0.2), 0 0 20px rgba(41, 123, 255, 0.4), 0 0 40px rgba(41, 123, 255, 0.2)'
              : isHovering
              ? '0 0 0 4px rgba(41, 123, 255, 0.15), 0 0 25px rgba(41, 123, 255, 0.5), 0 0 50px rgba(41, 123, 255, 0.3)'
              : '0 0 0 4px rgba(41, 123, 255, 0.1), 0 0 15px rgba(41, 123, 255, 0.3), 0 0 30px rgba(41, 123, 255, 0.15)',
          }}
        />
      </div>

      {/* Point central */}
      <div
        className="fixed pointer-events-none z-[10000] transition-transform duration-150 ease-out"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.5 : 1})`,
        }}
      >
          <div
            className="rounded-full transition-all duration-150"
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: '#297BFF',
              boxShadow: isClicking
                ? '0 0 8px rgba(41, 123, 255, 0.9), 0 0 16px rgba(41, 123, 255, 0.6), 0 0 24px rgba(41, 123, 255, 0.4)'
                : isHovering
                ? '0 0 10px rgba(41, 123, 255, 0.9), 0 0 20px rgba(41, 123, 255, 0.6), 0 0 30px rgba(41, 123, 255, 0.4)'
                : '0 0 6px rgba(41, 123, 255, 0.8), 0 0 12px rgba(41, 123, 255, 0.5), 0 0 18px rgba(41, 123, 255, 0.3)',
            }}
          />
      </div>
    </>
  )
}

