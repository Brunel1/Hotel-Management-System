'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import YieldManagementDashboard from '@/components/YieldManagementDashboard'
import DemandForecasting from '@/components/DemandForecasting'
import CompetitorAnalysis from '@/components/CompetitorAnalysis'

export default function AdminManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'yield' | 'forecast' | 'competitor'>('yield')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* En-tête */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Gestion Hôtelière - Management
            </Link>
            <nav className="flex gap-2 sm:gap-4 items-center flex-wrap">
              <ThemeToggle />
              <Link href="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm sm:text-base">
                Dashboard
              </Link>
              <Link href="/admin/rooms" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm sm:text-base">
                Chambres
              </Link>
              <Link href="/admin/bookings" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm sm:text-base">
                Réservations
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm sm:text-base"
              >
                Déconnexion
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Gestion avancée</h1>

        {/* Onglets */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('yield')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'yield'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Yield Management
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'forecast'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Prévision de la demande
          </button>
          <button
            onClick={() => setActiveTab('competitor')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'competitor'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Analyse des concurrents
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'yield' && <YieldManagementDashboard />}
        {activeTab === 'forecast' && <DemandForecasting />}
        {activeTab === 'competitor' && <CompetitorAnalysis />}
      </div>
    </div>
  )
}
