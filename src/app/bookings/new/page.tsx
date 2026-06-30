'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import BookingCalendar from '@/components/BookingCalendar'

interface Room {
  id: string
  number: string
  type: string
  capacity: number
  pricePerNight: number
  description: string
}

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('roomId')

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    specialRequests: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { today, tomorrow } = useMemo(() => {
    const todayDate = new Date().toISOString().split('T')[0]
    const tomorrowDate = new Date()
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrow = tomorrowDate.toISOString().split('T')[0]
    return { today: todayDate, tomorrow }
  }, [])

  const fetchRoom = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
      } else {
        setError('Chambre non trouvée')
      }
    } catch {
      setError('Une erreur est survenue lors du chargement de la chambre')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  const fetchAvailability = useCallback(async () => {
    if (!roomId) return
    
    try {
      const today = new Date()
      const sixMonthsLater = new Date()
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)
      
      const response = await fetch(
        `/api/rooms/${roomId}/availability?startDate=${today.toISOString().split('T')[0]}&endDate=${sixMonthsLater.toISOString().split('T')[0]}`
      )
      if (response.ok) {
        const data = await response.json()
        setUnavailableDates(data.unavailableDates)
      }
    } catch {
      console.error('Erreur lors de la récupération des disponibilités')
    }
  }, [roomId])

  useEffect(() => {
    const loadRoom = async () => {
      if (roomId) {
        await fetchRoom()
        await fetchAvailability()
      } else {
        setError('ID de chambre non fourni')
        setLoading(false)
      }
    }
    loadRoom()
  }, [roomId, fetchRoom, fetchAvailability])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'adults' || name === 'children' ? parseInt(value) : value
    }))
  }

  const handleDateSelect = (checkIn: string, checkOut: string) => {
    setFormData(prev => ({
      ...prev,
      checkIn,
      checkOut,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          roomId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Une erreur est survenue lors de la réservation')
      }
    } catch {
      setError('Une erreur est survenue lors de la réservation')
    } finally {
      setSubmitting(false)
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-indigo-600 hover:underline">
            Retour à l&apos;accueil
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
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Gestion Hôtelière
            </Link>
            <nav className="flex gap-4 items-center">
              <ThemeToggle />
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Accueil
              </Link>
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Mon compte
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Nouvelle réservation</h1>

          {room && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                Chambre {room.number} - {getRoomTypeLabel(room.type)}
              </h2>
              <p className="text-indigo-700 dark:text-indigo-300">{room.description}</p>
              <p className="text-indigo-900 dark:text-indigo-200 font-bold mt-2">{room.pricePerNight}€ / nuit</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sélectionnez vos dates *
              </label>
              <BookingCalendar
                roomId={roomId || ''}
                onDateSelect={handleDateSelect}
                unavailableDates={unavailableDates}
              />
              <input type="hidden" name="checkIn" value={formData.checkIn} />
              <input type="hidden" name="checkOut" value={formData.checkOut} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="adults" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre d&apos;adultes *
                </label>
                <input
                  id="adults"
                  name="adults"
                  type="number"
                  required
                  min="1"
                  max={room?.capacity ?? 10}
                  value={formData.adults}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="children" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre d&apos;enfants
                </label>
                <input
                  id="children"
                  name="children"
                  type="number"
                  min="0"
                  max={room ? Math.max(0, room.capacity - formData.adults) : 10}
                  value={formData.children}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Demandes spéciales (optionnel)
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                rows={4}
                value={formData.specialRequests}
                onChange={handleChange}
                placeholder="Vos demandes spéciales (ex: lit supplémentaire, régime alimentaire, etc.)"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
              </button>
              <Link
                href={`/rooms/${roomId}`}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
