'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
