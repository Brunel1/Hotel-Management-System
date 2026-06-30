'use client'

import { useState } from 'react'
import { X, Plus, ArrowRight } from 'lucide-react'

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
  amenities: Array<{
    amenity: {
      id: string
      name: string
      description: string
    }
  }>
}

interface RoomComparisonProps {
  rooms: Room[]
  onBook: (roomId: string) => void
}

export default function RoomComparison({ rooms, onBook }: RoomComparisonProps) {
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const toggleRoom = (room: Room) => {
    if (selectedRooms.find(r => r.id === room.id)) {
      setSelectedRooms(selectedRooms.filter(r => r.id !== room.id))
    } else if (selectedRooms.length < 3) {
      setSelectedRooms([...selectedRooms, room])
    }
  }

  const removeRoom = (roomId: string) => {
    setSelectedRooms(selectedRooms.filter(r => r.id !== roomId))
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

  const getAllAmenities = () => {
    const allAmenities = new Set<string>()
    selectedRooms.forEach(room => {
      room.amenities.forEach(item => {
        allAmenities.add(item.amenity.name)
      })
    })
    return Array.from(allAmenities)
  }

  const hasAmenity = (room: Room, amenity: string) => {
    return room.amenities.some(item => item.amenity.name === amenity)
  }

  if (selectedRooms.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Comparaison de chambres
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium px-3 py-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            {isOpen ? 'Fermer' : 'Comparer'}
          </button>
        </div>
        {isOpen && (
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Sélectionnez jusqu'à 3 chambres à comparer
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => toggleRoom(room)}
                  className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      Chambre {room.number}
                    </span>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {getRoomTypeLabel(room.type)} • {room.capacity} pers.
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 sm:mt-2">
                    {room.pricePerNight}€ / nuit
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comparaison de chambres ({selectedRooms.length}/3)
          </h3>
          <button
            onClick={() => {
              setSelectedRooms([])
              setIsOpen(false)
            }}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">
                Caractéristique
              </th>
              {selectedRooms.map(room => (
                <th key={room.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chambre {room.number}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="bg-white dark:bg-gray-800">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Type
              </td>
              {selectedRooms.map(room => (
                <td key={room.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {getRoomTypeLabel(room.type)}
                </td>
              ))}
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Capacité
              </td>
              {selectedRooms.map(room => (
                <td key={room.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {room.capacity} personnes
                </td>
              ))}
            </tr>
            <tr className="bg-white dark:bg-gray-800">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Prix / nuit
              </td>
              {selectedRooms.map(room => (
                <td key={room.id} className="px-6 py-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 text-center">
                  {room.pricePerNight}€
                </td>
              ))}
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Note
              </td>
              {selectedRooms.map(room => (
                <td key={room.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {room.reviewCount > 0 ? (
                    <span>
                      {room.averageRating.toFixed(1)} / 5
                      <span className="text-xs text-gray-500 ml-1">
                        ({room.reviewCount} avis)
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="bg-white dark:bg-gray-800">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Description
              </td>
              {selectedRooms.map(room => (
                <td key={room.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs">
                  <p className="line-clamp-3">{room.description}</p>
                </td>
              ))}
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Équipements
              </td>
              {selectedRooms.map(room => (
                <td key={room.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {room.amenities.slice(0, 3).map(item => (
                      <span key={item.amenity.id} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                        {item.amenity.name}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-xs text-gray-500">+{room.amenities.length - 3}</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap gap-4 justify-center">
          {selectedRooms.map(room => (
            <button
              key={room.id}
              onClick={() => removeRoom(room.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
            >
              <X className="w-4 h-4" />
              Retirer
            </button>
          ))}
          {selectedRooms.length < 3 && rooms.length > selectedRooms.length && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter une chambre
            </button>
          )}
        </div>
      </div>

      {isOpen && selectedRooms.length < 3 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Ajouter une chambre à comparer
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms
              .filter(room => !selectedRooms.find(r => r.id === room.id))
              .map(room => (
                <button
                  key={room.id}
                  onClick={() => toggleRoom(room)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Chambre {room.number}
                    </span>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getRoomTypeLabel(room.type)} • {room.capacity} pers.
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                    {room.pricePerNight}€ / nuit
                  </p>
                </button>
              ))}
          </div>
        </div>
      )}

      {selectedRooms.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
            Choisissez la chambre qui correspond le mieux à vos besoins
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {selectedRooms.map(room => (
              <button
                key={room.id}
                onClick={() => onBook(room.id)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Réserver la chambre {room.number}
                <ArrowRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
