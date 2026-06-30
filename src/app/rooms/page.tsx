'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import RoomFilterAdvanced, { RoomFilters } from '@/components/RoomFilterAdvanced'
import RoomComparison from '@/components/RoomComparison'

interface Room {
  id: string
  number: string
  type: string
  capacity: number
  pricePerNight: number
  description: string
  images: string[]
  averageRating: number
  reviewCount: number
}

export default function RoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<RoomFilters>({
    type: '',
    capacity: '',
    minPrice: '',
    maxPrice: '',
    amenities: [],
    minRating: '',
    availableOnly: false,
  })
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([])

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('http://localhost:3001/api/rooms', { headers })
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
        
        // Extraire les équipements disponibles
        const amenities = new Set<string>()
        data.forEach((room: Room) => {
          if (room.description) {
            const roomAmenities = room.description.split(',').map(a => a.trim())
            roomAmenities.forEach(a => amenities.add(a))
          }
        })
        setAvailableAmenities(Array.from(amenities))
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des chambres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = (roomId: string) => {
    router.push(`/bookings/new?roomId=${roomId}`)
  }

  const handleBookFromComparison = (roomId: string) => {
    handleBook(roomId)
  }

  const filteredRooms = rooms.filter(room => {
    if (filters.type && room.type !== filters.type) return false
    if (filters.capacity && room.capacity < parseInt(filters.capacity)) return false
    if (filters.minPrice && room.pricePerNight < parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && room.pricePerNight > parseFloat(filters.maxPrice)) return false
    if (filters.minRating && room.averageRating < parseFloat(filters.minRating)) return false
    return true
  })

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* En-tête */}
      <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">Gestion Hôtelière</h1>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                Retour
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Nos Chambres</h1>

        {/* Filtre avancé */}
        <div className="mb-8">
          <RoomFilterAdvanced
            filters={filters}
            setFilters={setFilters}
            availableAmenities={availableAmenities}
          />
        </div>

        {/* Comparaison de chambres */}
        <div className="mb-8">
          <RoomComparison rooms={filteredRooms} onBook={handleBookFromComparison} />
        </div>

        {/* Liste des chambres */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des chambres...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Aucune chambre ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chambre {room.number}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">{room.type}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{room.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{room.averageRating} ({room.reviewCount})</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{room.pricePerNight}€</p>
                  </div>
                  <button
                    onClick={() => handleBook(room.id)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium transition-colors"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
