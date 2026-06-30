'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Settings, RefreshCw } from 'lucide-react'

interface RoomPricing {
  roomId: string
  roomNumber: string
  roomType: string
  basePrice: number
  currentPrice: number
  occupancyRate: number
  demandLevel: 'low' | 'medium' | 'high'
  suggestedPrice: number
  priceHistory: Array<{
    date: string
    price: number
  }>
}

interface YieldManagementDashboardProps {
  dateRange?: {
    start: Date
    end: Date
  }
}

export default function YieldManagementDashboard({ dateRange }: YieldManagementDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [roomPricing, setRoomPricing] = useState<RoomPricing[]>([])
  const [autoPricing, setAutoPricing] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchPricingData()
  }, [dateRange])

  const fetchPricingData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const params = new URLSearchParams()
      if (dateRange) {
        params.append('start', dateRange.start.toISOString())
        params.append('end', dateRange.end.toISOString())
      }

      const response = await fetch(`/api/admin/yield-management?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRoomPricing(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de tarification:', error)
    } finally {
      setLoading(false)
    }
  }

  const applySuggestedPrice = async (roomId: string, suggestedPrice: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/yield-management/${roomId}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ price: suggestedPrice }),
      })

      if (response.ok) {
        await fetchPricingData()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prix:', error)
    }
  }

  const toggleAutoPricing = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/yield-management/auto-pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !autoPricing }),
      })

      if (response.ok) {
        setAutoPricing(!autoPricing)
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la tarification automatique:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchPricingData()
    setRefreshing(false)
  }

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getDemandLabel = (level: string) => {
    switch (level) {
      case 'high':
        return 'Forte'
      case 'medium':
        return 'Moyenne'
      case 'low':
        return 'Faible'
      default:
        return level
    }
  }

  const calculatePriceChange = (basePrice: number, currentPrice: number) => {
    const change = ((currentPrice - basePrice) / basePrice) * 100
    return change.toFixed(1)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yield Management</h3>
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
            <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yield Management</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAutoPricing}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                autoPricing
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {autoPricing ? 'Auto : Activé' : 'Auto : Désactivé'}
            </button>
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
              <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenu estimé</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {roomPricing.reduce((sum, room) => sum + room.currentPrice, 0).toLocaleString('fr-FR')}€
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Occupation moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(roomPricing.reduce((sum, room) => sum + room.occupancyRate, 0) / roomPricing.length).toFixed(1)}%
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Prix moyen</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(roomPricing.reduce((sum, room) => sum + room.currentPrice, 0) / roomPricing.length).toFixed(0)}€
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Chambres</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {roomPricing.length}
            </p>
          </div>
        </div>

        {/* Tableau de tarification */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Chambre</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Prix de base</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Prix actuel</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Variation</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Occupation</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Demande</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Prix suggéré</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {roomPricing.map((room) => (
                <tr key={room.roomId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    Chambre {room.roomNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {room.roomType}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {room.basePrice}€
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {room.currentPrice}€
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {parseFloat(calculatePriceChange(room.basePrice, room.currentPrice)) > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        parseFloat(calculatePriceChange(room.basePrice, room.currentPrice)) > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {calculatePriceChange(room.basePrice, room.currentPrice)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {room.occupancyRate}%
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(room.demandLevel)}`}>
                      {getDemandLabel(room.demandLevel)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {room.suggestedPrice}€
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => applySuggestedPrice(room.roomId, room.suggestedPrice)}
                      disabled={room.currentPrice === room.suggestedPrice}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Appliquer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
