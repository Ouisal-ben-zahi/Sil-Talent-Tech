'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FloatingButtonsContextType {
  areButtonsVisible: boolean
  setAreButtonsVisible: (visible: boolean) => void
  toggleButtons: () => void
}

const FloatingButtonsContext = createContext<FloatingButtonsContextType | undefined>(undefined)

export function FloatingButtonsProvider({ children }: { children: ReactNode }) {
  const [areButtonsVisible, setAreButtonsVisible] = useState(false)

  const toggleButtons = () => {
    setAreButtonsVisible((prev) => !prev)
  }

  return (
    <FloatingButtonsContext.Provider value={{ areButtonsVisible, setAreButtonsVisible, toggleButtons }}>
      {children}
    </FloatingButtonsContext.Provider>
  )
}

export function useFloatingButtons() {
  const context = useContext(FloatingButtonsContext)
  if (context === undefined) {
    throw new Error('useFloatingButtons must be used within a FloatingButtonsProvider')
  }
  return context
}


