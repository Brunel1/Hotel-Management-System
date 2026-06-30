'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface Booking {
  id: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  specialRequests: string | null
  totalPrice: number
  status: string
  user: {
    id: string
    email: string
    profile: {
      firstName: string
      lastName: string
      phone: string | null
      address: string | null
    }
  }
  room: {
    id: string
    number: string
    type: string
    capacity: number
    pricePerNight: number
    description: string
  }
}

export default function AdminBookingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBooking = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-role': 'ADMIN',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la réservation')
      }

      const data = await response.json()
      setBooking(data)
    } catch {
      setError('Erreur lors de la récupération de la réservation')
    } finally {
      setLoading(false)
    }
  }, [bookingId, router])

  useEffect(() => {
    const loadBooking = async () => {
      await fetchBooking()
    }
    loadBooking()
  }, [fetchBooking])

  const handleUpdateStatus = async (status: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-role': 'ADMIN',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchBooking()
      } else {
        alert('Erreur lors de la mise à jour de la réservation')
      }
    } catch {
      alert('Erreur lors de la mise à jour de la réservation')
    }
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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Réservation non trouvée'}</p>
          <Link href="/admin/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Retour au tableau de bord
          </Link>
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
            <Link href="/admin/dashboard" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Gestion Hôtelière - Admin
            </Link>
            <nav className="flex gap-4 items-center">
              <ThemeToggle />
              <Link href="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Tableau de bord
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  router.push('/')
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                Déconnexion
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Détails de la réservation</h1>
            <Link
              href="/admin/dashboard"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Retour au tableau de bord
            </Link>
          </div>

          {/* Statut de la réservation */}
          <div className="mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>

          {/* Informations du client */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Informations du client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.user.profile.firstName} {booking.user.profile.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.user.profile.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.user.profile.address || 'Non renseignée'}</p>
              </div>
            </div>
          </div>

          {/* Informations de la chambre */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Informations de la chambre</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Numéro</p>
                <p className="font-semibold text-gray-900 dark:text-white">Chambre {booking.room.number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="font-semibold text-gray-900 dark:text-white">{getRoomTypeLabel(booking.room.type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Capacité</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.room.capacity} personnes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Prix par nuit</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.room.pricePerNight}€</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-gray-900 dark:text-white">{booking.room.description}</p>
            </div>
          </div>

          {/* Détails de la réservation */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Détails de la réservation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date d&apos;arrivée</p>
                <p className="font-semibold text-gray-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date de départ</p>
                <p className="font-semibold text-gray-900 dark:text-white">{new Date(booking.checkOut).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adultes</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.adults}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enfants</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.children}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Prix total</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.totalPrice}€</p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Demandes spéciales</p>
                <p className="text-gray-900 dark:text-white">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {booking.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('CONFIRMED')}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
                >
                  Accepter la réservation
                </button>
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium"
                >
                  Refuser la réservation
                </button>
              </>
            )}
            {booking.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('CHECKED_IN')}
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-medium"
                >
                  Check-in
                </button>
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium"
                >
                  Annuler la réservation
                </button>
              </>
            )}
            {booking.status === 'CHECKED_IN' && (
              <button
                onClick={() => handleUpdateStatus('CHECKED_OUT')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                Check-out
              </button>
            )}
            {booking.status === 'CHECKED_OUT' && (
              <button
                onClick={() => handleUpdateStatus('COMPLETED')}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
              >
                Marquer comme terminée
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
