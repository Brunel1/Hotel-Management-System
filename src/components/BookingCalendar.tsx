'use client'

import { useState, useEffect } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, isAfter, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BookingCalendarProps {
  roomId: string
  onDateSelect: (checkIn: string, checkOut: string) => void
  unavailableDates?: string[]
}

export default function BookingCalendar({ roomId, onDateSelect, unavailableDates = [] }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null)
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay())
  const calendarEnd = new Date(monthEnd)
  calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()))

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const isUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      isSameDay(date, parseISO(unavailableDate))
    )
  }

  const isPast = (date: Date) => {
    return isBefore(date, new Date()) && !isToday(date)
  }

  const isInRange = (date: Date) => {
    if (!selectedCheckIn || !selectedCheckOut) return false
    if (hoveredDate) {
      return (isAfter(date, selectedCheckIn) && isBefore(date, hoveredDate)) ||
             (isAfter(date, selectedCheckIn) && isBefore(date, selectedCheckOut))
    }
    return isAfter(date, selectedCheckIn) && isBefore(date, selectedCheckOut)
  }

  const handleDateClick = (date: Date) => {
    if (isPast(date) || isUnavailable(date)) return

    if (!selectedCheckIn) {
      setSelectedCheckIn(date)
      setSelectedCheckOut(null)
    } else if (!selectedCheckOut) {
      if (isBefore(date, selectedCheckIn)) {
        setSelectedCheckIn(date)
      } else {
        setSelectedCheckOut(date)
        onDateSelect(
          format(selectedCheckIn, 'yyyy-MM-dd'),
          format(date, 'yyyy-MM-dd')
        )
      }
    } else {
      setSelectedCheckIn(date)
      setSelectedCheckOut(null)
    }
  }

  const handleMouseEnter = (date: Date) => {
    if (selectedCheckIn && !selectedCheckOut && !isPast(date) && !isUnavailable(date)) {
      setHoveredDate(date)
    }
  }

  const handleMouseLeave = () => {
    setHoveredDate(null)
  }

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const resetSelection = () => {
    setSelectedCheckIn(null)
    setSelectedCheckOut(null)
    setHoveredDate(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isSelected = selectedCheckIn && isSameDay(date, selectedCheckIn)
          const isCheckout = selectedCheckOut && isSameDay(date, selectedCheckOut)
          const isDateUnavailable = isUnavailable(date)
          const isDatePast = isPast(date)
          const dateIsInRange = isInRange(date)

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => handleMouseEnter(date)}
              onMouseLeave={handleMouseLeave}
              disabled={isDatePast || isDateUnavailable}
              className={`
                relative p-2 text-sm rounded-lg transition-all
                ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                ${isDatePast ? 'opacity-30 cursor-not-allowed' : ''}
                ${isDateUnavailable ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-not-allowed' : ''}
                ${isSelected ? 'bg-indigo-600 text-white font-bold' : ''}
                ${isCheckout ? 'bg-indigo-600 text-white font-bold' : ''}
                ${dateIsInRange && !isSelected && !isCheckout ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}
                ${!isSelected && !isCheckout && !isDateUnavailable && !isDatePast && !dateIsInRange ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
              `}
            >
              {format(date, 'd')}
              {isToday(date) && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {(selectedCheckIn || selectedCheckOut) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCheckIn && (
                <span className="mr-4">
                  <span className="font-medium">Arrivée:</span> {format(selectedCheckIn, 'dd MMM yyyy', { locale: fr })}
                </span>
              )}
              {selectedCheckOut && (
                <span>
                  <span className="font-medium">Départ:</span> {format(selectedCheckOut, 'dd MMM yyyy', { locale: fr })}
                </span>
              )}
            </div>
            <button
              onClick={resetSelection}
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-600 rounded" />
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-900/30 rounded" />
            <span>Période</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded" />
            <span>Indisponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <span>Passé</span>
          </div>
        </div>
      </div>
    </div>
  )
}
