'use client'

import { useState, useEffect } from 'react'
import { Key, QrCode, RefreshCw, Clock, Shield, AlertCircle } from 'lucide-react'

interface DigitalRoomKeyProps {
  bookingId?: string
  roomId?: string
}

export default function DigitalRoomKey({ bookingId, roomId }: DigitalRoomKeyProps) {
  const [loading, setLoading] = useState(true)
  const [keyData, setKeyData] = useState<{
    qrCode: string
    accessCode: string
    validFrom: string
    validUntil: string
    roomNumber: string
    isActive: boolean
  } | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchKeyData()
  }, [bookingId, roomId])

  const fetchKeyData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Non authentifié')
        return
      }

      const url = bookingId 
        ? `/api/bookings/${bookingId}/digital-key`
        : roomId 
        ? `/api/rooms/${roomId}/digital-key`
        : null

      if (!url) {
        setError('ID de réservation ou de chambre requis')
        return
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setKeyData(data)
      } else {
        setError('Clé numérique non disponible')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la clé numérique:', error)
      setError('Erreur lors du chargement de la clé numérique')
    } finally {
      setLoading(false)
    }
  }

  const refreshKey = async () => {
    setRefreshing(true)
    setError('')
    await fetchKeyData()
    setRefreshing(false)
  }

  const isValid = () => {
    if (!keyData) return false
    const now = new Date()
    const validFrom = new Date(keyData.validFrom)
    const validUntil = new Date(keyData.validUntil)
    return now >= validFrom && now <= validUntil && keyData.isActive
  }

  const getTimeRemaining = () => {
    if (!keyData) return null
    const now = new Date()
    const validUntil = new Date(keyData.validUntil)
    const diff = validUntil.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expirée'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}min`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clé numérique</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !keyData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clé numérique</h3>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error || 'Clé numérique non disponible'}</p>
        </div>
      </div>
    )
  }

  const valid = isValid()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clé numérique</h3>
          </div>
          <button
            onClick={refreshKey}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Rafraîchir la clé"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Statut de la clé */}
        <div className={`mb-6 p-4 rounded-lg ${valid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <div className="flex items-center gap-2">
            {valid ? (
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className={`font-semibold ${valid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {valid ? 'Clé active' : 'Clé inactive'}
              </p>
              <p className={`text-sm ${valid ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                Chambre {keyData.roomNumber}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center">
            <QrCode className="w-32 h-32 text-gray-800 dark:text-gray-200" />
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Scannez ce QR code à l'entrée de votre chambre
          </p>
        </div>

        {/* Code d'accès */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Code d'accès
          </label>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-widest">
              {keyData.accessCode}
            </p>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            Entrez ce code sur le clavier de la porte
          </p>
        </div>

        {/* Validité */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Valide du {new Date(keyData.validFrom).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Jusqu'au {new Date(keyData.validUntil).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {valid && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              <Clock className="w-4 h-4" />
              <span>Temps restant: {getTimeRemaining()}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h4 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2">Instructions</h4>
          <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1">
            <li>• Scannez le QR code ou entrez le code d'accès</li>
            <li>• La clé est valide uniquement pendant votre séjour</li>
            <li>• Ne partagez pas votre clé avec des tiers</li>
            <li>• En cas de problème, contactez la réception</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
