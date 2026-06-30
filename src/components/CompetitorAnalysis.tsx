'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Star, MapPin, RefreshCw, ExternalLink } from 'lucide-react'

interface Competitor {
  id: string
  name: string
  location: string
  distance: number
  averagePrice: number
  occupancyRate: number
  rating: number
  reviewCount: number
  amenities: string[]
  strengths: string[]
  weaknesses: string[]
  priceHistory: Array<{
    date: string
    price: number
  }>
}

interface CompetitorAnalysisProps {
  location?: string
  radius?: number
}

export default function CompetitorAnalysis({ location, radius = 10 }: CompetitorAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'occupancy' | 'rating'>('price')

  useEffect(() => {
    fetchCompetitorData()
  }, [location, radius])

  const fetchCompetitorData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const params = new URLSearchParams()
      if (location) params.append('location', location)
      params.append('radius', radius.toString())

      const response = await fetch(`/api/admin/competitor-analysis?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCompetitors(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données concurrentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchCompetitorData()
    setRefreshing(false)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400'
    if (rating >= 4.0) return 'text-blue-600 dark:text-blue-400'
    if (rating >= 3.5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return 'bg-green-500'
    if (occupancy >= 60) return 'bg-yellow-500'
    if (occupancy >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const calculateAveragePrice = () => {
    if (competitors.length === 0) return 0
    return competitors.reduce((sum, c) => sum + c.averagePrice, 0) / competitors.length
  }

  const calculateAverageRating = () => {
    if (competitors.length === 0) return 0
    return competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length
  }

  const calculateAverageOccupancy = () => {
    if (competitors.length === 0) return 0
    return competitors.reduce((sum, c) => sum + c.occupancyRate, 0) / competitors.length
  }

  const getSortedCompetitors = () => {
    switch (selectedMetric) {
      case 'price':
        return [...competitors].sort((a, b) => a.averagePrice - b.averagePrice)
      case 'occupancy':
        return [...competitors].sort((a, b) => b.occupancyRate - a.occupancyRate)
      case 'rating':
        return [...competitors].sort((a, b) => b.rating - a.rating)
      default:
        return competitors
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyse des concurrents</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyse des concurrents</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['price', 'occupancy', 'rating'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedMetric === metric
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {metric === 'price' ? 'Prix' : metric === 'occupancy' ? 'Occupation' : 'Note'}
                </button>
              ))}
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Concurrents</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {competitors.length}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Prix moyen</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateAveragePrice().toFixed(0)}€
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateAverageRating().toFixed(1)}/5
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Occupation moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateAverageOccupancy().toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Liste des concurrents */}
        <div className="space-y-4">
          {getSortedCompetitors().map((competitor) => (
            <div key={competitor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {competitor.name}
                    </h4>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{competitor.location}</span>
                    <span>•</span>
                    <span>{competitor.distance} km</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Prix moyen</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {competitor.averagePrice}€
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Occupation</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${competitor.occupancyRate}%`,
                              backgroundColor: getOccupancyColor(competitor.occupancyRate),
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {competitor.occupancyRate}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Note</p>
                      <div className="flex items-center gap-1">
                        <Star className={`w-4 h-4 ${getRatingColor(competitor.rating)} fill-current`} />
                        <span className={`text-lg font-bold ${getRatingColor(competitor.rating)}`}>
                          {competitor.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avis</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {competitor.reviewCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {competitor.amenities.slice(0, 5).map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {competitor.amenities.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                        +{competitor.amenities.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Points forts</p>
                    <ul className="text-xs text-green-600 dark:text-green-500 space-y-1">
                      {competitor.strengths.slice(0, 2).map((strength, index) => (
                        <li key={index}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Points faibles</p>
                    <ul className="text-xs text-red-600 dark:text-red-500 space-y-1">
                      {competitor.weaknesses.slice(0, 2).map((weakness, index) => (
                        <li key={index}>• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {competitors.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucun concurrent trouvé dans cette zone</p>
          </div>
        )}
      </div>
    </div>
  )
}
