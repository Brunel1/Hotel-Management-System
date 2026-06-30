'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowLeft, Heart, Calendar, MapPin, Star, Trash2, RefreshCw } from 'lucide-react'

interface Booking {
  id: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  totalPrice: number
  status: string
  specialRequests: string
  room: {
    id: string
    number: string
    type: string
    pricePerNight: number
    description: string
  }
}

interface FavoriteRoom {
  id: string
  number: string
  type: string
  capacity: number
  pricePerNight: number
  description: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [favorites, setFavorites] = useState<FavoriteRoom[]>([])
  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites'>('bookings')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth/login')
          return
        }

        // Récupérer les réservations
        const bookingsResponse = await fetch('/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData)
        }

        // Récupérer les favoris
        const favoritesResponse = await fetch('/api/user/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json()
          setFavorites(favoritesData.favorites)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const addToFavorites = async (roomId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites)
        setMessage('Chambre ajoutée aux favoris!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error)
    }
  }

  const removeFromFavorites = async (roomId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/user/favorites?roomId=${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites)
        setMessage('Chambre supprimée des favoris!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error)
    }
  }

  const isFavorite = (roomId: string) => {
    return favorites.some(fav => fav.id === roomId)
  }

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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
      COMPLETED: 'Terminée',
      CHECKED_IN: 'Check-in effectué',
      CHECKED_OUT: 'Check-out effectué',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CHECKED_IN: 'bg-purple-100 text-purple-800',
      CHECKED_OUT: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* En-tête */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historique & Favoris</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            {message}
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Réservations
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Heart className="w-5 h-5 inline mr-2" />
            Favoris
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'bookings' ? (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Aucune réservation trouvée</p>
                <Link
                  href="/"
                  className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Réserver une chambre
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Chambre {booking.room.number}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(booking.checkIn).toLocaleDateString('fr-FR')} - {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{getRoomTypeLabel(booking.room.type)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{booking.adults} adultes</span>
                          {booking.children > 0 && <span>• {booking.children} enfants</span>}
                        </div>
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {booking.totalPrice}€
                        </div>
                      </div>
                      {booking.specialRequests && (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          <strong>Demandes spéciales:</strong> {booking.specialRequests}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToFavorites(booking.room.id)}
                        disabled={isFavorite(booking.room.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isFavorite(booking.room.id)
                            ? 'bg-red-100 text-red-600 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 hover:text-red-600'
                        }`}
                        title={isFavorite(booking.room.id) ? 'Déjà dans les favoris' : 'Ajouter aux favoris'}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite(booking.room.id) ? 'fill-current' : ''}`} />
                      </button>
                      <Link
                        href={`/bookings/new?roomId=${booking.room.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                      >
                        Réserver à nouveau
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {favorites.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Aucune chambre favorite</p>
                <Link
                  href="/"
                  className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Découvrir nos chambres
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((room) => (
                  <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">{room.number}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Chambre {room.number}
                        </h3>
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-2 py-1 rounded">
                          {getRoomTypeLabel(room.type)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {room.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {room.capacity} personnes
                          </p>
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {room.pricePerNight}€ / nuit
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => removeFromFavorites(room.id)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Supprimer des favoris"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <Link
                            href={`/bookings/new?roomId=${room.id}`}
                            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                            title="Réserver"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
