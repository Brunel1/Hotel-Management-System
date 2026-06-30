'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  roomNumber: string
  checkIn: Date
  checkOut: Date
  status: string
  digitalKey?: string
}

export default function MobileCheckInOut() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDigitalKey, setShowDigitalKey] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: 'POST',
      })
      if (response.ok) {
        // Générer une clé digitale
        const keyResponse = await fetch(`/api/bookings/${bookingId}/digital-key`, {
          method: 'POST',
        })
        const keyData = await keyResponse.json()
        
        setSelectedBooking(bookings.find(b => b.id === bookingId) || null)
        setShowDigitalKey(true)
        fetchBookings()
      }
    } catch (error) {
      console.error('Erreur lors du check-in:', error)
    }
  }

  const handleCheckOut = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Erreur lors du check-out:', error)
    }
  }

  const canCheckIn = (booking: Booking) => {
    const now = new Date()
    const checkInDate = new Date(booking.checkIn)
    const checkOutDate = new Date(booking.checkOut)
    return (
      booking.status === 'CONFIRMED' &&
      now >= checkInDate &&
      now < checkOutDate
    )
  }

  const canCheckOut = (booking: Booking) => {
    const now = new Date()
    const checkOutDate = new Date(booking.checkOut)
    return (
      booking.status === 'CHECKED_IN' &&
      now >= checkOutDate
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Check-in / Check-out Mobile
      </h2>

      {/* Liste des réservations */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Aucune réservation en cours
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chambre {booking.roomNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Du {new Date(booking.checkIn).toLocaleDateString('fr-FR')} au{' '}
                    {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800' :
                  booking.status === 'CHECKED_OUT' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status === 'CONFIRMED' ? 'Confirmée' :
                   booking.status === 'CHECKED_IN' ? 'Arrivée' :
                   booking.status === 'CHECKED_OUT' ? 'Départ' :
                   booking.status}
                </span>
              </div>

              <div className="flex gap-2">
                {canCheckIn(booking) && (
                  <button
                    onClick={() => handleCheckIn(booking.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Check-in
                  </button>
                )}
                {canCheckOut(booking) && (
                  <button
                    onClick={() => handleCheckOut(booking.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Check-out
                  </button>
                )}
                {booking.status === 'CHECKED_IN' && booking.digitalKey && (
                  <button
                    onClick={() => {
                      setSelectedBooking(booking)
                      setShowDigitalKey(true)
                    }}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Voir la clé
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de clé digitale */}
      {showDigitalKey && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Clé Digitale
              </h3>
              <button
                onClick={() => setShowDigitalKey(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Chambre {selectedBooking.roomNumber}
                </p>
                <div className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {selectedBooking.digitalKey || 'XXXX-XXXX-XXXX'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Valide jusqu'au {new Date(selectedBooking.checkOut).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Copier la clé dans le presse-papier
                    if (selectedBooking.digitalKey) {
                      navigator.clipboard.writeText(selectedBooking.digitalKey)
                    }
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Copier
                </button>
                <button
                  onClick={() => setShowDigitalKey(false)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
