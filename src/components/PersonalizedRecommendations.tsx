'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Star, TrendingUp, Clock, MapPin } from 'lucide-react'

interface Room {
  id: string
  number: string
  type: string
  capacity: number
  pricePerNight: number
  description: string
  averageRating: number
  reviewCount: number
  images: string[]
}

interface Recommendation {
  room: Room
  reason: string
  score: number
  category: 'preference' | 'history' | 'popular' | 'similar'
}

interface PersonalizedRecommendationsProps {
  userId?: string
  maxRecommendations?: number
  onBook?: (roomId: string) => void
}

export default function PersonalizedRecommendations({ 
  userId, 
  maxRecommendations = 4,
  onBook 
}: PersonalizedRecommendationsProps) {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }

        // Récupérer les recommandations basées sur les préférences et l'historique
        const response = await fetch('/api/recommendations?type=rooms&checkIn=tomorrow&checkOut=tomorrow+7days', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setRecommendations(data.slice(0, maxRecommendations))
        }
      } catch (error) {
        console.error('Erreur lors du chargement des recommandations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [maxRecommendations])

  const getRoomTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      STANDARD: 'Standard',
      SUPERIOR: 'Supérieure',
      SUITE: 'Suite',
      DELUXE: 'Deluxe',
      FAMILY: 'Familiale',
    }
    return types[type] || type
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'preference':
        return <Star className="w-4 h-4" />
      case 'history':
        return <Clock className="w-4 h-4" />
      case 'popular':
        return <TrendingUp className="w-4 h-4" />
      case 'similar':
        return <MapPin className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'preference':
        return 'Selon vos préférences'
      case 'history':
        return 'Basé sur votre historique'
      case 'popular':
        return 'Populaire'
      case 'similar':
        return 'Similaire à vos réservations'
      default:
        return 'Recommandé'
    }
  }

  const handleBook = (roomId: string) => {
    if (onBook) {
      onBook(roomId)
    } else {
      router.push(`/bookings/new?roomId=${roomId}`)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recommandations personnalisées</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recommandations personnalisées</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.room.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-32 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center relative">
              <span className="text-white text-4xl font-bold">{rec.room.number}</span>
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                {getCategoryIcon(rec.category)}
                <span>{getCategoryLabel(rec.category)}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Chambre {rec.room.number}
                </h4>
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-2 py-1 rounded">
                  {getRoomTypeLabel(rec.room.type)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {rec.room.description}
              </p>
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  {rec.room.averageRating.toFixed(1)} ({rec.room.reviewCount})
                </span>
                <span>•</span>
                <span>{rec.room.capacity} pers.</span>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded mb-3">
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  {rec.reason}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-bold text-indigo-600 dark:text-indigo-400">
                  {rec.room.pricePerNight}€ / nuit
                </p>
                <button
                  onClick={() => handleBook(rec.room.id)}
                  className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors"
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
