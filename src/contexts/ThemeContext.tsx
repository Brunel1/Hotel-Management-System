'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ThemeConfig, getThemeById } from '@/lib/themes'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  highContrast: boolean
  toggleHighContrast: () => void
  colorTheme: ThemeConfig
  setColorTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [highContrast, setHighContrast] = useState(false)
  const [colorTheme, setColorThemeState] = useState<ThemeConfig>(getThemeById('default'))
  const [mounted, setMounted] = useState(false)

  // Charger le thème, le contraste et le thème de couleurs depuis localStorage lors du montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const savedContrast = localStorage.getItem('highContrast') === 'true'
    const savedColorTheme = localStorage.getItem('colorTheme')
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Détection de la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
    
    setHighContrast(savedContrast)
    
    if (savedColorTheme) {
      setColorThemeState(getThemeById(savedColorTheme))
    }
    
    setMounted(true)
  }, [])

  // Appliquer le thème, le contraste et le thème de couleurs au document
  useEffect(() => {
    const root = document.documentElement

    // Appliquer le thème
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Appliquer le mode contraste élevé
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Appliquer les couleurs personnalisées
    root.style.setProperty('--color-primary', colorTheme.primary)
    root.style.setProperty('--color-secondary', colorTheme.secondary)
    root.style.setProperty('--color-accent', colorTheme.accent)

    // Convertir les couleurs hex en RGB pour les transparences
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null
    }

    root.style.setProperty('--color-primary-rgb', hexToRgb(colorTheme.primary) || '79, 70, 229')
    root.style.setProperty('--color-secondary-rgb', hexToRgb(colorTheme.secondary) || '124, 58, 237')
    root.style.setProperty('--color-accent-rgb', hexToRgb(colorTheme.accent) || '6, 182, 212')

    console.log('Variables CSS appliquées:', {
      primary: colorTheme.primary,
      secondary: colorTheme.secondary,
      accent: colorTheme.accent,
      computedPrimary: getComputedStyle(root).getPropertyValue('--color-primary'),
    })

    // Sauvegarder dans localStorage
    if (mounted) {
      localStorage.setItem('theme', theme)
      localStorage.setItem('highContrast', highContrast.toString())
      localStorage.setItem('colorTheme', colorTheme.id)
    }
  }, [theme, highContrast, colorTheme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev)
  }

  const setColorTheme = (themeId: string) => {
    setColorThemeState(getThemeById(themeId))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, highContrast, toggleHighContrast, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider')
  }
  return context
}
