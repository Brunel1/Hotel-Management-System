// Composant client pour la gestion des chambres
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Search, Filter, Image, Bed, Users, DollarSign, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'

// Interface définissant la structure d'une chambre
interface Room {
  id: string                    // Identifiant unique de la chambre
  number: string               // Numéro de la chambre
  type: 'standard' | 'superior' | 'suite' | 'deluxe' | 'family'  // Type de chambre
  pricePerNight: number        // Prix par nuit
  capacity: number             // Capacité d'accueil (nombre de personnes)
  description: string          // Description de la chambre
  amenities: string[]          // Liste des équipements
  images: string[]             // URLs des images de la chambre
  available: boolean           // Disponibilité pour réservation
  floor: number                // Étage de la chambre
  size: number                 // Surface en m²
}

// Composant principal de gestion des chambres
export default function RoomsManager() {
  // États du composant
  const [rooms, setRooms] = useState<Room[]>([])                    // Liste des chambres
  const [loading, setLoading] = useState(true)                       // État de chargement
  const [showModal, setShowModal] = useState(false)                  // Affichage du modal
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)   // Chambre en cours d'édition
  const [searchTerm, setSearchTerm] = useState('')                   // Terme de recherche
  const [selectedType, setSelectedType] = useState<string>('all')    // Type de chambre sélectionné
  const [selectedRoomImages, setSelectedRoomImages] = useState<string[]>([])  // Images de la galerie
  const [showImageGallery, setShowImageGallery] = useState(false)    // Affichage de la galerie

  // Chargement initial des chambres
  useEffect(() => {
    fetchRooms()
  }, [])

  // Récupération des chambres depuis l'API
  const fetchRooms = async () => {
    try {
      // Récupération du token d'authentification depuis localStorage
      const token = localStorage.getItem('token')
      console.log('Token:', token ? 'Présent' : 'Absent')

      // Configuration des en-têtes HTTP
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Appel à l'API pour récupérer les chambres
      const response = await fetch('/api/admin/rooms', { headers })
      console.log('Response status:', response.status)

      // Parsing de la réponse JSON
      const data = await response.json()
      console.log('Data reçue:', data)

      // Vérification et logging des données
      if (Array.isArray(data)) {
        console.log('Nombre de chambres:', data.length)
        if (data.length > 0) {
          console.log('Première chambre images:', data[0].images)
        }
      }

      // Mise à jour de l'état avec les chambres récupérées
      setRooms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement des chambres:', error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  // Filtrage des chambres selon le type et le terme de recherche
  const filteredRooms = Array.isArray(rooms) ? rooms.filter(room => {
    const matchesType = selectedType === 'all' || room.type === selectedType
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  }) : []

  // Sauvegarde d'une chambre (création ou modification)
  const handleSave = async (roomData: Partial<Room>) => {
    try {
      // Récupération du token d'authentification
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Détermination de l'URL et de la méthode HTTP selon qu'on crée ou modifie
      const url = editingRoom ? `/api/admin/rooms/${editingRoom.id}` : '/api/admin/rooms'
      const method = editingRoom ? 'PUT' : 'POST'

      // Envoi de la requête à l'API
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(roomData)
      })

      // Si la sauvegarde réussit, on rafraîchit la liste et on ferme le modal
      if (response.ok) {
        await fetchRooms()
        setShowModal(false)
        setEditingRoom(null)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  // Suppression d'une chambre
  const handleDelete = async (roomId: string) => {
    // Confirmation de la suppression
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) return

    try {
      // Récupération du token d'authentification
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Envoi de la requête de suppression à l'API
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
        headers
      })

      // Si la suppression réussit, on rafraîchit la liste
      if (response.ok) {
        await fetchRooms()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  // Basculement de la disponibilité d'une chambre
  const handleToggleAvailability = async (roomId: string, available: boolean) => {
    try {
      // Récupération du token d'authentification
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Envoi de la requête de mise à jour à l'API
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ available: !available })
      })

      // Si la mise à jour réussit, on rafraîchit la liste
      if (response.ok) {
        await fetchRooms()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Rendu principal de l'interface
  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Chambres</h2>
          <p className="text-gray-600 dark:text-gray-400">Ajoutez, modifiez ou supprimez des chambres</p>
        </div>
        <button
          onClick={() => { setEditingRoom(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Nouvelle chambre
        </button>
      </div>

      {/* Filtres de recherche et de type */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une chambre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">Tous types</option>
          <option value="standard">Standard</option>
          <option value="superior">Supérieure</option>
          <option value="suite">Suite</option>
          <option value="deluxe">Deluxe</option>
          <option value="family">Familiale</option>
        </select>
      </div>

      {/* Grille des chambres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            onEdit={() => { setEditingRoom(room); setShowModal(true) }}
            onDelete={() => handleDelete(room.id)}
            onToggleAvailability={() => handleToggleAvailability(room.id, room.available)}
            onViewImages={() => {
              setSelectedRoomImages(room.images)
              setShowImageGallery(true)
            }}
          />
        ))}
      </div>

      {/* Modal de création/modification */}
      {showModal && (
        <RoomModal
          room={editingRoom}
          onClose={() => { setShowModal(false); setEditingRoom(null) }}
          onSave={handleSave}
        />
      )}

      {/* Galerie d'images */}
      {showImageGallery && (
        <ImageGallery
          images={selectedRoomImages}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  )
}

// Composant affichant une carte de chambre individuelle
function RoomCard({ room, onEdit, onDelete, onToggleAvailability, onViewImages }: {
  room: Room
  onEdit: () => void
  onDelete: () => Promise<void>
  onToggleAvailability: () => Promise<void>
  onViewImages: () => void
}) {
  // Labels pour les types de chambres
  const typeLabels = {
    standard: 'Standard',
    superior: 'Supérieure',
    suite: 'Suite',
    deluxe: 'Deluxe',
    family: 'Familiale'
  }

  // Rendu de la carte de chambre
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Section image avec clic pour ouvrir la galerie */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 cursor-pointer" onClick={onViewImages}>
        {room.images.length > 0 ? (
          <>
            <img src={room.images[0]} alt={room.number} className="w-full h-full object-cover" />
            {room.images.length > 1 && (
              <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                +{room.images.length - 1} photos
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bed className="w-16 h-16 text-white/50" />
          </div>
        )}
        {/* Boutons d'action (modifier, supprimer) */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/90 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash className="w-4 h-4 text-white" />
          </button>
        </div>
        {/* Badge de disponibilité */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            room.available
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {room.available ? 'Disponible' : 'Indisponible'}
          </span>
        </div>
      </div>

      {/* Section informations de la chambre */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Chambre {room.number}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{typeLabels[room.type]}</p>
          </div>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{room.pricePerNight}€</p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{room.capacity} pers.</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{room.size} m²</span>
          </div>
        </div>

        {/* Bouton de basculement de disponibilité */}
        <button
          onClick={onToggleAvailability}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            room.available
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
          }`}
        >
          {room.available ? 'Marquer indisponible' : 'Marquer disponible'}
        </button>
      </div>
    </div>
  )
}

// Composant de galerie d'images en plein écran
function ImageGallery({ images, onClose }: {
  images: string[]
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Navigation vers l'image suivante
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  // Navigation vers l'image précédente
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Si pas d'images, ne rien afficher
  if (images.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      {/* Bouton de fermeture */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Bouton image précédente */}
      <button
        onClick={prevImage}
        className="absolute left-4 text-white hover:text-gray-300 z-10"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Bouton image suivante */}
      <button
        onClick={nextImage}
        className="absolute right-4 text-white hover:text-gray-300 z-10"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Image courante */}
      <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`Gallery ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Indicateurs de position */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Composant modal pour créer ou modifier une chambre
function RoomModal({ room, onClose, onSave }: {
  room: Room | null
  onClose: () => void
  onSave: (data: Partial<Room>) => void
}) {
  // État du formulaire avec valeurs par défaut ou valeurs de la chambre à modifier
  const [formData, setFormData] = useState<Partial<Room>>(room || {
    number: '',
    type: 'standard',
    pricePerNight: 0,
    capacity: 2,
    description: '',
    amenities: [],
    images: [],
    available: true,
    floor: 1,
    size: 20
  })

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  // Liste des équipements disponibles
  const amenityOptions = ['Wi-Fi', 'Climatisation', 'TV', 'Minibar', 'Coffre-fort', 'Salle de bain', 'Balcon', 'Vue mer', 'Baignoire spa', 'Service chambre']

  // Basculement d'un équipement
  const toggleAmenity = (amenity: string) => {
    const current = formData.amenities || []
    if (current.includes(amenity)) {
      setFormData({ ...formData, amenities: current.filter(a => a !== amenity) })
    } else {
      setFormData({ ...formData, amenities: [...current, amenity] })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {room ? 'Modifier la chambre' : 'Nouvelle chambre'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numéro</label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Room['type'] })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="standard">Standard</option>
                <option value="superior">Supérieure</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe</option>
                <option value="family">Familiale</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix (€)</label>
              <input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacité</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Étage</label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taille (m²)</label>
            <input
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Équipements</label>
            <div className="grid grid-cols-2 gap-2">
              {amenityOptions.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-2 rounded-lg text-sm text-left transition-colors ${
                    (formData.amenities || []).includes(amenity)
                      ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-500'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {(formData.amenities || []).includes(amenity) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                    {amenity}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URLs des images (une par ligne)</label>
            <textarea
              value={(formData.images || []).join('\n')}
              onChange={(e) => setFormData({ ...formData, images: e.target.value.split('\n').filter(url => url.trim()) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="available" className="text-sm text-gray-700 dark:text-gray-300">Disponible à la réservation</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              {room ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
