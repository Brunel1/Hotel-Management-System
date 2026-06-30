'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import fr from 'date-fns/locale/fr'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  fr: fr,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Room {
  id: string
  number: string
  type: string
  capacity: number
  pricePerNight: number
}

interface Booking {
  id: string
  roomId: string
  checkIn: string
  checkOut: string
  status: string
  room: Room
}

interface AvailabilityData {
  rooms: Room[]
  availability: Record<string, Record<string, boolean>>
  bookings: Booking[]
}

export default function AdminAvailabilityPage() {
  const router = useRouter()
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [currentDate, setCurrentDate] = useState(new Date())

  const fetchAvailability = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const startDate = new Date(currentDate)
      startDate.setDate(startDate.getDate() - 7)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + 30)

      const response = await fetch(
        `/api/admin/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-role': 'ADMIN',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des disponibilités')
      }

      const data = await response.json()
      setAvailabilityData(data)
    } catch {
      // Erreur silencieuse pour l'instant
    } finally {
      setLoading(false)
    }
  }, [router, currentDate])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
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

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      STANDARD: 'Standard',
      SUPERIOR: 'Supérieure',
      SUITE: 'Suite',
      DELUXE: 'Deluxe',
      FAMILY: 'Familiale',
    }
    return labels[type] || type
  }

  const isRoomAvailable = (roomId: string, date: Date) => {
    if (!availabilityData) return true
    const dateKey = date.toISOString().split('T')[0]
    return availabilityData.availability[roomId]?.[dateKey] ?? true
  }

  const getBookingsForDate = (date: Date) => {
    if (!availabilityData) return []
    const dateKey = date.toISOString().split('T')[0]
    return availabilityData.bookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      return date >= checkIn && date < checkOut
    })
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
            <Link href="/admin/dashboard" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Gestion Hôtelière - Admin
            </Link>
            <nav className="flex gap-4 items-center">
              <ThemeToggle />
              <Link href="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Tableau de bord
              </Link>
              <Link href="/admin/reports" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Rapports
              </Link>
              <Link href="/admin/seasons" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Saisons
              </Link>
              <Link href="/admin/availability" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Disponibilités
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendrier des disponibilités</h1>
          <div className="flex gap-4">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Toutes les chambres</option>
              {availabilityData?.rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Chambre {room.number} - {getRoomTypeLabel(room.type)}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <Calendar
            localizer={localizer}
            events={availabilityData?.bookings.map((booking) => ({
              id: booking.id,
              title: `Chambre ${booking.room.number} - ${getStatusLabel(booking.status)}`,
              start: new Date(booking.checkIn),
              end: new Date(booking.checkOut),
              resource: booking.roomId,
            })) || []}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={['month', 'week', 'day', 'agenda']}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            eventPropGetter={(event) => {
              const booking = availabilityData?.bookings.find((b) => b.id === event.id)
              const statusColor = booking ? getStatusColor(booking.status) : 'bg-gray-100'
              return {
                className: statusColor,
              }
            }}
          />
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Détail des chambres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availabilityData?.rooms.map((room) => (
              <div
                key={room.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Chambre {room.number}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getRoomTypeLabel(room.type)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Capacité: {room.capacity} personnes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Prix: {Number(room.pricePerNight)}€/nuit
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
