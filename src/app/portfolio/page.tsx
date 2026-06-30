'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PortfolioPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page d'accueil
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirection vers la page d'accueil...</p>
      </div>
    </div>
  )
}
