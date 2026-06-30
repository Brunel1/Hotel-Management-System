'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import EmailCampaigns from '@/components/EmailCampaigns'
import PromoCodeManager from '@/components/PromoCodeManager'
import SocialMediaIntegration from '@/components/SocialMediaIntegration'
import LoyaltyProgram from '@/components/LoyaltyProgram'

export default function AdminMarketingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'email' | 'promo' | 'social' | 'loyalty'>('email')

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
              Gestion Hôtelière - Marketing
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Marketing</h1>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Campagnes Email
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'promo'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Codes Promo
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'social'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Réseaux Sociaux
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'loyalty'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Programme de Fidélité
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'email' && <EmailCampaigns />}
        {activeTab === 'promo' && <PromoCodeManager />}
        {activeTab === 'social' && <SocialMediaIntegration />}
        {activeTab === 'loyalty' && <LoyaltyProgram />}
      </div>
    </div>
  )
}
