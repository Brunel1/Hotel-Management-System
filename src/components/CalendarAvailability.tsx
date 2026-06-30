'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
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
  isActive: boolean
}

interface Booking {
  id: string
  roomId: string
  checkIn: Date
  checkOut: Date
  status: 'confirmed' | 'pending' | 'cancelled'
  room?: Room
}

interface CalendarAvailabilityProps {
  roomId?: string
  onDateSelect?: (start: Date, end: Date) => void
}

export default function CalendarAvailability({ roomId, onDateSelect }: CalendarAvailabilityProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(roomId)
  const [view, setView] = useState(Views.MONTH)
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    fetchBookings()
  }, [selectedRoom])

  const fetchBookings = async () => {
    try {
      const url = selectedRoom 
        ? `/api/bookings?roomId=${selectedRoom}`
        : '/api/bookings'
      const response = await fetch(url)
      const data = await response.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error)
      setBookings([])
    }
  }

  const events = bookings.map(booking => ({
    id: booking.id,
    title: booking.status === 'confirmed' ? 'Réservé' : booking.status === 'pending' ? 'En attente' : 'Annulé',
    start: new Date(booking.checkIn),
    end: new Date(booking.checkOut),
    resource: {
      status: booking.status,
      roomId: booking.roomId,
      roomNumber: booking.room?.number,
    },
  }))

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3b82f6' // blue-500
    if (event.resource.status === 'confirmed') {
      backgroundColor = '#22c55e' // green-500
    } else if (event.resource.status === 'pending') {
      backgroundColor = '#f59e0b' // amber-500
    } else if (event.resource.status === 'cancelled') {
      backgroundColor = '#ef4444' // red-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (onDateSelect) {
      onDateSelect(start, end)
    }
  }

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Calendrier des disponibilités
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sélectionnez une période pour voir les disponibilités des chambres
        </p>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Confirmé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">En attente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Annulé</span>
        </div>
      </div>

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectSlot={handleSelectSlot}
          selectable
          view={view}
          onView={setView}
          date={date}
          onNavigate={handleNavigate}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          messages={{
            today: "Aujourd'hui",
            previous: 'Précédent',
            next: 'Suivant',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
            noEventsInRange: 'Aucun événement',
          }}
        />
      </div>
    </div>
  )
}
