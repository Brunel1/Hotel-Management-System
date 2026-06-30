'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, BarChart3, RefreshCw, Filter } from 'lucide-react'

interface DemandForecast {
  date: string
  predictedOccupancy: number
  predictedRevenue: number
  confidence: number
  factors: {
    seasonality: number
    events: number
    historical: number
    weather: number
  }
}

interface DemandForecastingProps {
  days?: number
}

export default function DemandForecasting({ days = 30 }: DemandForecastingProps) {
  const [loading, setLoading] = useState(true)
  const [forecasts, setForecasts] = useState<DemandForecast[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '14' | '30' | '90'>('30')

  useEffect(() => {
    fetchForecasts()
  }, [selectedPeriod])

  const fetchForecasts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/demand-forecast?days=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setForecasts(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prévisions:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchForecasts()
    setRefreshing(false)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return 'bg-red-500'
    if (occupancy >= 60) return 'bg-yellow-500'
    if (occupancy >= 40) return 'bg-green-500'
    return 'bg-blue-500'
  }

  const calculateAverageOccupancy = () => {
    if (forecasts.length === 0) return 0
    return forecasts.reduce((sum, f) => sum + f.predictedOccupancy, 0) / forecasts.length
  }

  const calculateTotalRevenue = () => {
    if (forecasts.length === 0) return 0
    return forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0)
  }

  const calculateAverageConfidence = () => {
    if (forecasts.length === 0) return 0
    return forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prévision de la demande</h3>
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
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prévision de la demande</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['7', '14', '30', '90'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {period}j
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Occupation moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateAverageOccupancy().toFixed(1)}%
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenu estimé</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateTotalRevenue().toLocaleString('fr-FR')}€
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Confiance moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateAverageConfidence().toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Graphique de prévision */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Évolution de l'occupation</h4>
          <div className="h-48 flex items-end gap-1">
            {forecasts.map((forecast, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1"
                title={`${new Date(forecast.date).toLocaleDateString('fr-FR')}: ${forecast.predictedOccupancy.toFixed(1)}%`}
              >
                <div
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${forecast.predictedOccupancy}%`,
                    backgroundColor: getOccupancyColor(forecast.predictedOccupancy),
                  }}
                />
                {forecasts.length <= 14 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(forecast.date).getDate()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau détaillé */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Occupation prévue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Revenu prévu</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Confiance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Facteurs</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.slice(0, 10).map((forecast, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {new Date(forecast.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${forecast.predictedOccupancy}%`,
                            backgroundColor: getOccupancyColor(forecast.predictedOccupancy),
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {forecast.predictedOccupancy.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {forecast.predictedRevenue.toLocaleString('fr-FR')}€
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(forecast.confidence)}`}>
                      {forecast.confidence.toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex gap-2">
                      <span title="Saisonnalité">S: {forecast.factors.seasonality.toFixed(2)}</span>
                      <span title="Événements">E: {forecast.factors.events.toFixed(2)}</span>
                      <span title="Historique">H: {forecast.factors.historical.toFixed(2)}</span>
                      <span title="Météo">M: {forecast.factors.weather.toFixed(2)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {forecasts.length > 10 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            Affichage des 10 premiers jours sur {forecasts.length} jours
          </p>
        )}
      </div>
    </div>
  )
}
