'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface Booking {
  id: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  totalPrice: number
  status: string
  room: {
    number: string
    type: string
    pricePerNight: number
  }
}

interface User {
  id: string
  email: string
  role: string
  profile: {
    firstName: string
    lastName: string
    phone?: string
    address?: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch {
      console.error('Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }

      await fetchBookings()
    }
    loadDashboard()
  }, [router, fetchBookings])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
      COMPLETED: 'Terminée',
      CHECKED_IN: 'Arrivée',
      CHECKED_OUT: 'Départ',
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

  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchBookings()
      } else {
        alert('Erreur lors de l\'annulation de la réservation')
      }
    } catch {
      alert('Erreur lors de l\'annulation de la réservation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
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
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Gestion Hôtelière
            </Link>
            <nav className="flex gap-4 items-center flex-wrap">
              <ThemeToggle />
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Accueil
              </Link>
              <Link href="/dashboard/history" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Historique
              </Link>
              <Link href="/dashboard/preferences" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Préférences
              </Link>
              <Link href="/check-in" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Check-in
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                Déconnexion
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations utilisateur */}
        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bienvenue, {user.profile.firstName} {user.profile.lastName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.profile.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.profile.address || 'Non renseignée'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Réservations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mes réservations</h2>
            <Link
              href="/"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium"
            >
              Nouvelle réservation
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Vous n&apos;avez aucune réservation</p>
              <Link
                href="/"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Découvrir nos chambres
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Chambre {booking.room.number}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{getRoomTypeLabel(booking.room.type)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Arrivée</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Départ</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{new Date(booking.checkOut).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Personnes</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.adults} adultes, {booking.children} enfants</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Prix total</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.totalPrice}€</p>
                    </div>
                  </div>
                  {booking.status === 'PENDING' && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        Annuler la réservation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
