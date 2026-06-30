'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { defaultThemes } from '@/lib/themes'

export default function ThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme()

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700 dark:text-gray-300">Thème:</span>
      <select
        value={colorTheme.id}
        onChange={(e) => setColorTheme(e.target.value)}
        className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      >
        {defaultThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  )
}
