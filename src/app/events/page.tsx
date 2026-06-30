'use client'

import { useState } from 'react'
import Link from 'next/link'

interface EventSpace {
  id: string
  name: string
  type: 'meeting' | 'conference' | 'wedding' | 'banquet'
  capacity: number
  pricePerHour: number
  description: string
  features: string[]
  image: string
}

const eventSpaces: EventSpace[] = [
  {
    id: '1',
    name: 'Salle de réunion A',
    type: 'meeting',
    capacity: 20,
    pricePerHour: 150,
    description: 'Salle de réunion moderne avec équipement audiovisuel complet',
    features: ['Projecteur', 'Écran', 'Wi-Fi', 'Climatisation', 'Tableau blanc'],
    image: '🏢',
  },
  {
    id: '2',
    name: 'Salle de conférence Grand Hall',
    type: 'conference',
    capacity: 200,
    pricePerHour: 500,
    description: 'Grande salle de conférence idéale pour les événements d\'entreprise',
    features: ['Système son', 'Écrans multiples', 'Wi-Fi haut débit', 'Climatisation', 'Podium'],
    image: '🎤',
  },
  {
    id: '3',
    name: 'Salle de bal Royal',
    type: 'wedding',
    capacity: 300,
    pricePerHour: 800,
    description: 'Salle élégante parfaite pour les mariages et événements spéciaux',
    features: ['Piste de danse', 'Éclairage ambiance', 'Sonorisation', 'Cuisine sur place', 'Décoration'],
    image: '💒',
  },
  {
    id: '4',
    name: 'Salle banquet Prestige',
    type: 'banquet',
    capacity: 150,
    pricePerHour: 400,
    description: 'Salle de banquet pour dîners et réceptions',
    features: ['Service traiteur', 'Cuisine équipée', 'Climatisation', 'Sonorisation', 'Parking'],
    image: '🍽️',
  },
]

export default function EventsPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredSpaces = filter === 'all' 
    ? eventSpaces 
    : eventSpaces.filter(space => space.type === filter)

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: 'Réunion',
      conference: 'Conférence',
      wedding: 'Mariage',
      banquet: 'Banquet',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-100 text-blue-800',
      conference: 'bg-purple-100 text-purple-800',
      wedding: 'bg-pink-100 text-pink-800',
      banquet: 'bg-green-100 text-green-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
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
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nos Espaces Événementiels
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Organisez vos événements dans nos salles modernes et élégantes
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('meeting')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === 'meeting'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Réunions
          </button>
          <button
            onClick={() => setFilter('conference')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === 'conference'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Conférences
          </button>
          <button
            onClick={() => setFilter('wedding')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === 'wedding'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Mariages
          </button>
          <button
            onClick={() => setFilter('banquet')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === 'banquet'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Banquets
          </button>
        </div>

        {/* Grille des espaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSpaces.map((space) => (
            <div
              key={space.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <span className="text-8xl">{space.image}</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {space.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(space.type)}`}>
                    {getTypeLabel(space.type)}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {space.description}
                </p>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {space.capacity} personnes
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {space.pricePerHour}€/heure
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Équipements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {space.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/group-booking"
                  className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium text-center transition-colors"
                >
                  Réserver cet espace
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              🎯 Événements d'entreprise
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Conférences, séminaires, lancements de produits et réunions d'affaires
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              💒 Mariages
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Salles de réception élégantes pour votre jour spécial
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              🍽️ Réceptions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Banquets, dîners de gala et événements privés
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
