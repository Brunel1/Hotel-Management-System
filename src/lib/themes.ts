export interface ThemeConfig {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
}

export const defaultThemes: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Défaut (Indigo)',
    primary: '#4F46E5',
    secondary: '#7C3AED',
    accent: '#06B6D4',
    background: '#ffffff',
    foreground: '#171717',
  },
  {
    id: 'ocean',
    name: 'Océan',
    primary: '#0EA5E9',
    secondary: '#0284C7',
    accent: '#38BDF8',
    background: '#ffffff',
    foreground: '#171717',
  },
  {
    id: 'forest',
    name: 'Forêt',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10B981',
    background: '#ffffff',
    foreground: '#171717',
  },
  {
    id: 'sunset',
    name: 'Coucher de soleil',
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#FB923C',
    background: '#ffffff',
    foreground: '#171717',
  },
  {
    id: 'royal',
    name: 'Royal',
    primary: '#7C3AED',
    secondary: '#6D28D9',
    accent: '#8B5CF6',
    background: '#ffffff',
    foreground: '#171717',
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#F472B6',
    background: '#ffffff',
    foreground: '#171717',
  },
]

export function getThemeById(id: string): ThemeConfig {
  return defaultThemes.find(theme => theme.id === id) || defaultThemes[0]
}
