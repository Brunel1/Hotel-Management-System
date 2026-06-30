'use client'

import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'

interface RoomFilterAdvancedProps {
  onFilterChange: (filters: RoomFilters) => void
  availableAmenities?: string[]
}

export interface RoomFilters {
  type: string
  capacity: string
  minPrice: string
  maxPrice: string
  amenities: string[]
  minRating: string
  availableOnly: boolean
}

export default function RoomFilterAdvanced({ onFilterChange, availableAmenities = [] }: RoomFilterAdvancedProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<RoomFilters>({
    type: '',
    capacity: '',
    minPrice: '',
    maxPrice: '',
    amenities: [],
    minRating: '',
    availableOnly: false,
  })

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== '' && v !== false && (Array.isArray(v) ? v.length > 0 : true)
  ).length

  const roomTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'STANDARD', label: 'Standard' },
    { value: 'SUPERIOR', label: 'Supérieure' },
    { value: 'SUITE', label: 'Suite' },
    { value: 'DELUXE', label: 'Deluxe' },
    { value: 'FAMILY', label: 'Familiale' },
  ]

  const capacities = [
    { value: '', label: 'Toutes les capacités' },
    { value: '1', label: '1 personne' },
    { value: '2', label: '2 personnes' },
    { value: '3', label: '3 personnes' },
    { value: '4', label: '4 personnes' },
    { value: '5', label: '5 personnes' },
    { value: '6', label: '6+ personnes' },
  ]

  const ratings = [
    { value: '', label: 'Toutes les notes' },
    { value: '4', label: '4+ étoiles' },
    { value: '3', label: '3+ étoiles' },
    { value: '2', label: '2+ étoiles' },
    { value: '1', label: '1+ étoile' },
  ]

  const handleFilterChange = (key: keyof RoomFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity]
    
    handleFilterChange('amenities', newAmenities)
  }

  const resetFilters = () => {
    const resetFilters: RoomFilters = {
      type: '',
      capacity: '',
      minPrice: '',
      maxPrice: '',
      amenities: [],
      minRating: '',
      availableOnly: false,
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false && (Array.isArray(value) ? value.length > 0 : true)
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Bouton pour ouvrir/fermer les filtres */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
            Filtres avancés
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Panneau de filtres */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {/* Type de chambre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de chambre
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {roomTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capacité
              </label>
              <select
                value={filters.capacity}
                onChange={(e) => handleFilterChange('capacity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {capacities.map(cap => (
                  <option key={cap.value} value={cap.value}>
                    {cap.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note minimale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note minimale
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {ratings.map(rating => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prix minimum (€)
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min"
                min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Prix maximum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prix maximum (€)
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max"
                min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Disponibilité uniquement */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Disponibles uniquement
                </span>
              </label>
            </div>
          </div>

          {/* Équipements */}
          {availableAmenities.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Équipements
              </label>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                      ${filters.amenities.includes(amenity)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {amenity}
                    {filters.amenities.includes(amenity) && (
                      <X className="w-3 h-3 inline ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
