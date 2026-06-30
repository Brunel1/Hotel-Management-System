'use client'

import { useState, useEffect } from 'react'
import { Tag, Plus, Edit, Trash2, Copy, TrendingUp, Users, Calendar, Percent } from 'lucide-react'

interface PromoCode {
  id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_night'
  discountValue: number
  minBookingAmount?: number
  maxDiscountAmount?: number
  validFrom: string
  validUntil: string
  usageLimit: number
  usageCount: number
  isActive: boolean
  applicableRoomTypes?: string[]
  applicableSeasons?: string[]
  targetAudience?: 'all' | 'new' | 'vip' | 'loyalty'
  restrictions?: {
    minNights?: number
    maxNights?: number
    blackoutDates?: string[]
  }
}

interface PromoCodeManagerProps {
  userId?: string
}

export default function PromoCodeManager({ userId }: PromoCodeManagerProps) {
  const [loading, setLoading] = useState(true)
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/promo-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPromoCodes(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des codes promo:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPromoCode = async (codeData: Partial<PromoCode>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(codeData),
      })

      if (response.ok) {
        await fetchPromoCodes()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création du code promo:', error)
    }
  }

  const updatePromoCode = async (codeId: string, updates: Partial<PromoCode>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/promo-codes/${codeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchPromoCodes()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du code promo:', error)
    }
  }

  const deletePromoCode = async (codeId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/promo-codes/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchPromoCodes()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du code promo:', error)
    }
  }

  const toggleCodeStatus = async (code: PromoCode) => {
    await updatePromoCode(code.id, { isActive: !code.isActive })
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getUsageRate = (code: PromoCode) => {
    if (code.usageLimit === 0) return 0
    return ((code.usageCount / code.usageLimit) * 100).toFixed(1)
  }

  const isExpired = (code: PromoCode) => {
    return new Date(code.validUntil) < new Date()
  }

  const isUpcoming = (code: PromoCode) => {
    return new Date(code.validFrom) > new Date()
  }

  const getStatusColor = (code: PromoCode) => {
    if (!code.isActive) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    if (isExpired(code)) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    if (isUpcoming(code)) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }

  const getStatusLabel = (code: PromoCode) => {
    if (!code.isActive) return 'Désactivé'
    if (isExpired(code)) return 'Expiré'
    if (isUpcoming(code)) return 'À venir'
    return 'Actif'
  }

  const calculateTotalSavings = () => {
    return promoCodes.reduce((sum, code) => {
      if (code.discountType === 'percentage') {
        return sum + (code.discountValue * code.usageCount)
      } else if (code.discountType === 'fixed') {
        return sum + code.discountValue * code.usageCount
      }
      return sum
    }, 0)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Tag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion des codes promo</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion des codes promo</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouveau code
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Codes actifs</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {promoCodes.filter(c => c.isActive && !isExpired(c)).length}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Utilisations totales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {promoCodes.reduce((sum, c) => sum + c.usageCount, 0).toLocaleString('fr-FR')}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Économies totales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateTotalSavings().toLocaleString('fr-FR')}€
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Réduction moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {promoCodes.length > 0
                ? (promoCodes.reduce((sum, c) => sum + c.discountValue, 0) / promoCodes.length).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>

        {/* Liste des codes promo */}
        <div className="space-y-4">
          {promoCodes.map((code) => (
            <div key={code.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                        {code.code}
                      </h4>
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                      {copiedCode === code.code && (
                        <span className="text-xs text-green-600 dark:text-green-400">Copié!</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(code)}`}>
                      {getStatusLabel(code)}
                    </span>
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 text-xs rounded">
                      {code.discountType === 'percentage' ? `${code.discountValue}%` : code.discountType === 'fixed' ? `${code.discountValue}€` : 'Nuit gratuite'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {code.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Validité</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(code.validFrom).toLocaleDateString('fr-FR')} - {new Date(code.validUntil).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Utilisations</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {code.usageCount} / {code.usageLimit === 0 ? '∞' : code.usageLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Taux d'utilisation</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${getUsageRate(code)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getUsageRate(code)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Public cible</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {code.targetAudience || 'Tous'}
                      </p>
                    </div>
                  </div>

                  {(code.minBookingAmount || code.maxDiscountAmount) && (
                    <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {code.minBookingAmount && (
                        <span>Min. {code.minBookingAmount}€</span>
                      )}
                      {code.maxDiscountAmount && (
                        <span>Max. {code.maxDiscountAmount}€</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCode(code)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => toggleCodeStatus(code)}
                    className={`p-2 rounded-lg transition-colors ${
                      code.isActive
                        ? 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                        : 'hover:bg-green-100 dark:hover:bg-green-900/30'
                    }`}
                    title={code.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {code.isActive ? (
                      <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </button>
                  <button
                    onClick={() => deletePromoCode(code.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {promoCodes.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aucun code promo créé</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Créer un code promo
            </button>
          </div>
        )}
      </div>

      {/* Modal de création (simplifié) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouveau code promo</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le formulaire de création de code promo sera implémenté avec les champs nécessaires.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  createPromoCode({
                    code: 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                    description: 'Code promo de test',
                    discountType: 'percentage',
                    discountValue: 10,
                    validFrom: new Date().toISOString(),
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    usageLimit: 100,
                    usageCount: 0,
                    isActive: true,
                  })
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
