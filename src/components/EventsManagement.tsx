'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, Plus, Edit, Trash, Search, Filter, CheckCircle, XCircle, Clock as PendingIcon } from 'lucide-react'

interface EventSpace {
  id: string
  name: string
  type: 'meeting' | 'conference' | 'wedding' | 'party' | 'dining'
  capacity: number
  area: number
  pricePerHour: number
  pricePerDay: number
  amenities: string[]
  images: string[]
  availability: boolean
}

interface EventBooking {
  id: string
  spaceId: string
  spaceName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  eventType: string
  date: Date
  startTime: string
  endTime: string
  guests: number
  catering: boolean
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalPrice: number
  specialRequests?: string
}

export default function EventsManagement() {
  const [spaces, setSpaces] = useState<EventSpace[]>([])
  const [bookings, setBookings] = useState<EventBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'spaces' | 'bookings'>('spaces')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEventsData()
  }, [])

  const fetchEventsData = async () => {
    try {
      const [spacesRes, bookingsRes] = await Promise.all([
        fetch('/api/events/spaces'),
        fetch('/api/events/bookings')
      ])
      const spacesData = await spacesRes.json()
      const bookingsData = await bookingsRes.json()
      setSpaces(spacesData)
      setBookings(bookingsData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSpaces = spaces.filter(space => {
    const matchesType = selectedType === 'all' || space.type === selectedType
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Événements</h2>
          <p className="text-gray-600 dark:text-gray-400">Salles de réunion, mariages et événements privés</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90">
          <Plus className="w-5 h-5" /> Nouvelle réservation
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab('spaces')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'spaces' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}>Espaces</button>
        <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'bookings' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}>Réservations</button>
      </div>

      {activeTab === 'spaces' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option value="all">Tous types</option>
              <option value="meeting">Réunions</option>
              <option value="conference">Conférences</option>
              <option value="wedding">Mariages</option>
              <option value="party">Soirées</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map(space => (
              <div key={space.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{space.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{space.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${space.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {space.availability ? 'Disponible' : 'Occupé'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{space.capacity} personnes</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{space.area} m²</span></div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{space.pricePerHour}€<span className="text-sm font-normal">/heure</span></p>
                    <p className="text-xs text-gray-500">{space.pricePerDay}€/jour</p>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90">Réserver</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{booking.eventType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>{booking.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{booking.spaceName} - {booking.clientName}</p>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{new Date(booking.date).toLocaleDateString('fr-FR')}</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{booking.startTime} - {booking.endTime}</span></div>
                    <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{booking.guests} pers.</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{booking.totalPrice}€</p>
                  <div className="flex gap-2 mt-2">
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-5 h-5" /></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><XCircle className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
