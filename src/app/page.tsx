'use client'

// Force recompilation to fix hydration - portfolio and advertising links added
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import ThemeSelector from '@/components/ThemeSelector'
import GoogleMap from '@/components/GoogleMap'
import CalendarAvailability from '@/components/CalendarAvailability'
import RoomFilterAdvanced, { RoomFilters } from '@/components/RoomFilterAdvanced'
import RoomComparison from '@/components/RoomComparison'
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations'
import PushNotificationManager from '@/components/PushNotificationManager'
import AssistantIA from '@/components/AssistantIA'

// Types pour les chambres
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

export default function Home() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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

  // Charger les chambres avec les filtres
  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.capacity) params.append('capacity', filters.capacity)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.minRating) params.append('minRating', filters.minRating)
      if (filters.availableOnly) params.append('availableOnly', 'true')
      filters.amenities.forEach(amenity => {
        params.append('amenities', amenity)
      })

      const response = await fetch(`/api/rooms?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des chambres:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger les équipements disponibles
  const fetchAmenities = async () => {
    try {
      const response = await fetch('/api/amenities')
      if (response.ok) {
        const data = await response.json()
        setAvailableAmenities(data.map((a: any) => a.name))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error)
    }
  }

  // Charger les chambres au montage du composant
  useEffect(() => {
    const loadRooms = async () => {
      await fetchRooms()
      await fetchAmenities()
    }
    loadRooms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gérer le scroll pour changer la couleur du header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mettre à jour les filtres et recharger les chambres
  const handleFilterChange = (newFilters: RoomFilters) => {
    setFilters(newFilters)
    setLoading(true)
    fetchRooms()
  }

  // Gérer la réservation depuis le comparateur
  const handleBookFromComparison = (roomId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    router.push(`/bookings/new?roomId=${roomId}`)
  }

  // Traduire les types de chambres
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-primary/20 dark:from-gray-900 dark:to-gray-800">
      {/* En-tête moderne avec menu */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-gray-800 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className={`text-xl sm:text-2xl font-bold transition-colors ${isScrolled ? 'text-primary dark:text-primary' : 'text-white'}`}>Gestion Hôtelière</h1>
            </Link>

            {/* Menu de navigation simplifié */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={`font-medium transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary' : 'text-white hover:text-primary/80'}`}>
                Home
              </Link>
              <Link href="/rooms" className={`font-medium transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary' : 'text-white hover:text-primary/80'}`}>
                Rooms
              </Link>
              <Link href="/events" className={`font-medium transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary' : 'text-white hover:text-primary/80'}`}>
                Events
              </Link>
              <div className="relative group">
                <button className={`flex items-center gap-1 font-medium transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary' : 'text-white hover:text-primary/80'}`}>
                  More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-700">
                  <div className="py-2">
                    <Link href="/group-booking" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Group Booking
                    </Link>
                    <Link href="/portfolio" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Portfolio
                    </Link>
                    <Link href="/advertising" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Advertising
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Contrôles et authentification */}
            <div className={`flex items-center gap-2 pl-4 border-l transition-colors ${isScrolled ? 'border-gray-200 dark:border-gray-700' : 'border-white/30'}`}>
              <ThemeSelector />
              <ThemeToggle />
              <PushNotificationManager />
              <div className={`hidden sm:flex items-center gap-2 pl-4 border-l transition-colors ${isScrolled ? 'border-gray-200 dark:border-gray-700' : 'border-white/30'}`}>
                <Link href="/auth/login" className={`flex items-center gap-2 text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-primary/80 hover:bg-white/10'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Connexion
                </Link>
                <Link href="/auth/register" className="flex items-center gap-2 text-sm sm:text-base bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:from-primary/90 hover:to-secondary/90 font-medium transition-all shadow-md hover:shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Inscription
                </Link>
              </div>
              {/* Menu mobile */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Menu mobile simplifié */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 animate-in slide-in-from-top duration-200">
              <div className="flex flex-col gap-2">
              <Link href="/" className={`font-medium py-2 px-3 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-primary/80 hover:bg-white/10'}`}>
                Home
              </Link>
              <Link href="/rooms" className={`font-medium py-2 px-3 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-primary/80 hover:bg-white/10'}`}>
                Rooms
              </Link>
              <Link href="/events" className={`font-medium py-2 px-3 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-primary/80 hover:bg-white/10'}`}>
                Events
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <p className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${isScrolled ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'}`}>More</p>
                <Link href="/group-booking" className={`font-medium py-2 px-3 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-primary/80 hover:bg-white/10'}`}>
                  Group Booking
                </Link>
                <Link href="/portfolio" className={`font-medium py-2 px-3 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-primary/80 hover:bg-white/10'}`}>
                  Portfolio
                </Link>
                <Link href="/advertising" className={`font-medium py-2 px-3 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-primary/80 hover:bg-white/10'}`}>
                  Advertising
                </Link>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <p className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${isScrolled ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'}`}>Account</p>
                <Link href="/auth/login" className={`font-medium py-2 px-3 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-primary/80 hover:bg-white/10'}`}>
                  Login
                </Link>
                <Link href="/auth/register" className="flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:from-primary/90 hover:to-secondary/90 font-medium transition-all shadow-md hover:shadow-lg">
                  Sign Up
                </Link>
              </div>
            </div>
            </nav>
          )}
        </div>
      </header>

      {/* Section héro */}
      <section className="bg-primary text-white py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Bienvenue dans notre hôtel</h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8">Découvrez nos chambres confortables et profitez d&apos;un séjour inoubliable</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/rooms" className="bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 font-medium transition-colors text-sm sm:text-base">
              Voir les chambres
            </Link>
            <Link href="/bookings/new" className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary font-medium transition-colors text-sm sm:text-base">
              Réserver maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Comparaison de chambres */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <RoomComparison rooms={rooms} onBook={handleBookFromComparison} />
      </section>

      {/* Section introduction hôtel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              À propos de notre hôtel
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Situé au cœur de Mahajanga, notre hôtel vous offre un cadre exceptionnel pour vos séjours professionnels et personnels. Avec nos chambres modernes et équipées, nous nous engageons à vous offrir une expérience inoubliable.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Profitez de nos services premium : restaurant gastronomique, spa, piscine, salle de sport, et bien plus encore. Notre équipe dévouée est à votre disposition 24h/24 pour rendre votre séjour parfait.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">50 chambres luxueuses</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Restaurant gastronomique</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Spa & bien-être</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Piscine extérieure</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg p-8 text-white">
            <h4 className="text-xl font-bold mb-4">Pourquoi nous choisir ?</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Emplacement privilégié au cœur de Mahajanga</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Service client disponible 24h/24 et 7j/7</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Équipements modernes et haut de gamme</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Tarifs compétitifs et offres spéciales</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Filtres avancés */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <RoomFilterAdvanced
          onFilterChange={handleFilterChange}
          availableAmenities={availableAmenities}
        />
      </section>

      {/* Catalogue des chambres */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Chargement des chambres...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucune chambre disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="h-36 sm:h-48 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))`
                  }}
                >
                  <span className="text-white text-4xl sm:text-6xl font-bold">{room.number}</span>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Chambre {room.number}</h3>
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                      {getRoomTypeLabel(room.type)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{room.description}</p>
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {room.capacity} personnes
                    </span>
                    {room.reviewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {room.averageRating.toFixed(1)} ({room.reviewCount})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-primary">{room.pricePerNight.toLocaleString()} Ar</p>
                      <p className="text-xs sm:text-sm text-gray-500">par nuit</p>
                    </div>
                    <Link
                      href={`/rooms/${room.id}`}
                      className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 font-medium text-sm text-center"
                    >
                      Réserver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section Localisation mx-auto */}
      <section className="px-25 py-12 justify-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Notre Localisation
        </h2>
        <GoogleMap
          address="123 Rue de l'Hôtel, Mahajanga, Madagascar"
          lat={-15.7167}
          lng={46.3167}
          zoom={15}
          height="400px"
        />
      </section>


      {/* Section Calendrier de disponibilités */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <CalendarAvailability />
      </section>

      {/* Recommandations personnalisées */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PersonalizedRecommendations />
      </section>


      {/* Footer moderne */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* À propos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">À propos</h3>
              <p className="text-gray-400 text-sm">
                Gestion Hôtelière est votre partenaire pour des séjours inoubliables. Nous offrons des chambres confortables et des services de qualité.
              </p>
            </div>

            {/* Liens rapides */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/rooms" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Chambres
                  </Link>
                </li>
                <li>
                  <Link href="/group-booking" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Réservation Groupée
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Événements
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+26134000000" className="hover:text-white transition-colors">
                    +261 34 00 000 00
                  </a>
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contact@gestionhotel.mg" className="hover:text-white transition-colors">
                    contact@gestionhotel.mg
                  </a>
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <a href="https://maps.google.com/?q=123+Rue+de+l'Hôtel,+Mahajanga" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    123 Rue de l'Hôtel, Mahajanga
                  </a>
                </li>
              </ul>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Barre inférieure */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Gestion Hôtelière. Tous droits réservés.
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>Développé par</span>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Hervé Brunel
                </a>
                <span>•</span>
                <span className="text-gray-600">Madagascar</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Assistant IA */}
      <AssistantIA />
    </div>
  )
}
