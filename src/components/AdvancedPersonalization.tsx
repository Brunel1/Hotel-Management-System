'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Palette, Clock, TrendingUp, X, Gift } from 'lucide-react'

interface PersonalizationData {
  seasonalTheme: 'spring' | 'summer' | 'autumn' | 'winter' | 'default'
  browsingHistory: string[]
  preferences: {
    roomTypes: string[]
    priceRange: { min: number; max: number }
    amenities: string[]
  }
  recommendations: {
    rooms: string[]
    packages: string[]
  }
}

export default function AdvancedPersonalization() {
  const [data, setData] = useState<PersonalizationData | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [currentBanner, setCurrentBanner] = useState<any>(null)

  useEffect(() => {
    loadPersonalization()
    checkSeasonalTheme()
    loadRecommendations()
  }, [])

  const loadPersonalization = async () => {
    try {
      const response = await fetch('/api/personalization')
      const personalizationData = await response.json()
      setData(personalizationData)
    } catch (error) {
      console.error('Erreur lors du chargement de la personnalisation:', error)
    }
  }

  const checkSeasonalTheme = () => {
    const month = new Date().getMonth()
    let theme: 'spring' | 'summer' | 'autumn' | 'winter' | 'default'

    if (month >= 2 && month <= 4) theme = 'spring'
    else if (month >= 5 && month <= 7) theme = 'summer'
    else if (month >= 8 && month <= 10) theme = 'autumn'
    else if (month === 11 || month === 0 || month === 1) theme = 'winter'

    // Appliquer le thème saisonnier
    document.documentElement.setAttribute('data-season', theme)

    // Afficher une bannière promotionnelle saisonnière
    const banners = {
      spring: {
        title: '🌸 Offre Printemps',
        message: 'Profitez de -20% sur toutes les réservations ce mois-ci !',
        color: 'from-pink-500 to-green-500'
      },
      summer: {
        title: '☀️ Été ensoleillé',
        message: 'Packs famille : enfants gratuits jusqu\'à 12 ans !',
        color: 'from-yellow-500 to-orange-500'
      },
      autumn: {
        title: '🍂 Automne doré',
        message: 'Week-end romantique avec petit-déjeuner inclus',
        color: 'from-orange-500 to-red-500'
      },
      winter: {
        title: '❄️ Magie de l\'hiver',
        message: 'Séjours ski avec forfait remise -15%',
        color: 'from-blue-500 to-purple-500'
      },
      default: null
    }

    if (banners[theme] && !localStorage.getItem('seasonal_banner_dismissed')) {
      setCurrentBanner(banners[theme])
      setShowBanner(true)
    }
  }

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations/personalized')
      const recommendations = await response.json()
      if (data) {
        setData({ ...data, recommendations })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error)
    }
  }

  const dismissBanner = () => {
    localStorage.setItem('seasonal_banner_dismissed', 'true')
    setShowBanner(false)
  }

  if (!data) return null

  return (
    <>
      {/* Seasonal Banner */}
      {showBanner && currentBanner && (
        <div className={`fixed top-0 left-0 right-0 bg-gradient-to-r ${currentBanner.color} text-white p-4 z-50 shadow-lg`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">{currentBanner.title}</h3>
                <p className="text-sm opacity-90">{currentBanner.message}</p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Personalized Recommendations Section */}
      <div className="space-y-6">
        {/* Based on Browsing History */}
        {data.browsingHistory.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Basé sur votre historique de navigation
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.recommendations.rooms.slice(0, 3).map((roomId) => (
                <div key={roomId} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Chambre recommandée</p>
                  <p className="font-medium text-gray-900 dark:text-white">{roomId}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Based on Preferences */}
        {data.preferences && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Adapté à vos préférences
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Types de chambres :</span>
                <span>{data.preferences.roomTypes.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Budget :</span>
                <span>{data.preferences.priceRange.min}€ - {data.preferences.priceRange.max}€</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Équipements préférés :</span>
                <span>{data.preferences.amenities.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Trending */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Tendances du moment
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.packages.map((pkg, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{pkg}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Très populaire cette semaine</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
