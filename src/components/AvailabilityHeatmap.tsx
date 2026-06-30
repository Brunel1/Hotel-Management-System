'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Filter, Legend, Info } from 'lucide-react'

interface RoomAvailability {
  roomId: string
  roomNumber: string
  roomType: string
  availability: Record<string, 'available' | 'booked' | 'maintenance' | 'blocked'>
}

export default function AvailabilityHeatmap() {
  const [availability, setAvailability] = useState<RoomAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all')

  useEffect(() => {
    fetchAvailability()
  }, [currentMonth])

  const fetchAvailability = async () => {
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const response = await fetch(`/api/availability/heatmap?year=${year}&month=${month}`)
      const data = await response.json()
      setAvailability(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la disponibilité:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getDaysArray = () => {
    const days = []
    const totalDays = getDaysInMonth(currentMonth)
    for (let i = 1; i <= totalDays; i++) {
      days.push(i)
    }
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getColorClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600'
      case 'booked':
        return 'bg-red-500 hover:bg-red-600'
      case 'maintenance':
        return 'bg-orange-500 hover:bg-orange-600'
      case 'blocked':
        return 'bg-gray-500 hover:bg-gray-600'
      default:
        return 'bg-gray-300'
    }
  }

  const filteredAvailability = availability.filter(room => 
    selectedRoomType === 'all' || room.roomType === selectedRoomType
  )

  const roomTypes = [...new Set(availability.map(r => r.roomType))]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const days = getDaysArray()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Heatmap des Disponibilités</h2>
          <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de l'occupation des chambres</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Tous types</option>
            {roomTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Bloqué</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-700/50">
                Chambre
              </th>
              {days.map(day => (
                <th key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[40px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAvailability.map(room => (
              <tr key={room.roomId} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 sticky left-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{room.roomNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{room.roomType}</p>
                  </div>
                </td>
                {days.map(day => {
                  const dateKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const status = room.availability[dateKey] || 'available'
                  return (
                    <td key={day} className="px-1 py-1">
                      <div
                        className={`w-8 h-8 rounded ${getColorClass(status)} cursor-pointer transition-colors`}
                        title={`${room.roomNumber} - ${day}/${currentMonth.getMonth() + 1}: ${status}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Disponible</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {filteredAvailability.reduce((acc, room) => {
              return acc + Object.values(room.availability).filter(s => s === 'available').length
            }, 0)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Réservé</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {filteredAvailability.reduce((acc, room) => {
              return acc + Object.values(room.availability).filter(s => s === 'booked').length
            }, 0)}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Maintenance</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {filteredAvailability.reduce((acc, room) => {
              return acc + Object.values(room.availability).filter(s => s === 'maintenance').length
            }, 0)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Taux d'occupation</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(
              (filteredAvailability.reduce((acc, room) => {
                return acc + Object.values(room.availability).filter(s => s === 'booked').length
              }, 0) /
              (filteredAvailability.length * days.length)) * 100
            )}%
          </p>
        </div>
      </div>
    </div>
  )
}
