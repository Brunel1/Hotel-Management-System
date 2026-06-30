'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Gift, Clock, Percent, Calendar, Tag, Sparkles } from 'lucide-react'

interface Package {
  id: string
  name: string
  description: string
  type: 'romantic' | 'family' | 'business' | 'wellness' | 'adventure' | 'seasonal'
  discount: number
  validFrom: Date
  validUntil: Date
  includes: string[]
  roomTypes: string[]
  minNights: number
  maxGuests: number
  price: number
  originalPrice: number
  isActive: boolean
  isFlashSale: boolean
  flashSaleEnd?: Date
}

export default function PackagesManager() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'flash'>('all')

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Erreur lors du chargement des packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPackages = packages.filter(pkg => {
    if (filter === 'active') return pkg.isActive && new Date(pkg.validUntil) > new Date()
    if (filter === 'expired') return !pkg.isActive || new Date(pkg.validUntil) < new Date()
    if (filter === 'flash') return pkg.isFlashSale && pkg.flashSaleEnd && new Date(pkg.flashSaleEnd) > new Date()
    return true
  })

  const typeIcons = {
    romantic: <Gift className="w-5 h-5 text-pink-500" />,
    family: <Sparkles className="w-5 h-5 text-blue-500" />,
    business: <Tag className="w-5 h-5 text-purple-500" />,
    wellness: <Sparkles className="w-5 h-5 text-green-500" />,
    adventure: <Sparkles className="w-5 h-5 text-orange-500" />,
    seasonal: <Calendar className="w-5 h-5 text-yellow-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Offres & Packages</h2>
          <p className="text-gray-600 dark:text-gray-400">Créez et gérez vos offres promotionnelles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Nouvelle offre
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'flash', 'expired'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map(pkg => (
          <div
            key={pkg.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all ${
              pkg.isFlashSale
                ? 'border-orange-500 shadow-orange-200 dark:shadow-orange-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {pkg.isFlashSale && pkg.flashSaleEnd && new Date(pkg.flashSaleEnd) > new Date() && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 text-center">
                ⚡ FLASH SALE
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {typeIcons[pkg.type]}
                  <h3 className="font-semibold text-gray-900 dark:text-white">{pkg.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditingPackage(pkg); setShowForm(true) }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{pkg.description}</p>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{pkg.price}€</span>
                  <span className="text-sm text-gray-500 line-through">{pkg.originalPrice}€</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">-{pkg.discount}%</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{pkg.minNights} nuits minimum</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Percent className="w-4 h-4" />
                  <span>Valide jusqu'au {new Date(pkg.validUntil).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-1">
                  {pkg.includes.slice(0, 3).map((item, index) => (
                    <span key={index} className="text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  pkg.isActive ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <PackageForm
          package={editingPackage}
          onClose={() => { setShowForm(false); setEditingPackage(null) }}
          onSuccess={fetchPackages}
        />
      )}
    </div>
  )
}

function PackageForm({ package: pkg, onClose, onSuccess }: { package: Package | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    description: pkg?.description || '',
    type: pkg?.type || 'romantic',
    discount: pkg?.discount || 10,
    validFrom: pkg?.validFrom ? new Date(pkg.validFrom).toISOString().split('T')[0] : '',
    validUntil: pkg?.validUntil ? new Date(pkg.validUntil).toISOString().split('T')[0] : '',
    includes: pkg?.includes?.join(', ') || '',
    roomTypes: pkg?.roomTypes?.join(', ') || '',
    minNights: pkg?.minNights || 1,
    maxGuests: pkg?.maxGuests || 2,
    price: pkg?.price || 0,
    originalPrice: pkg?.originalPrice || 0,
    isActive: pkg?.isActive ?? true,
    isFlashSale: pkg?.isFlashSale || false,
    flashSaleEnd: pkg?.flashSaleEnd ? new Date(pkg.flashSaleEnd).toISOString().split('T')[0] : ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = pkg ? `/api/packages/${pkg.id}` : '/api/packages'
      const method = pkg ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          includes: formData.includes.split(',').map(s => s.trim()),
          roomTypes: formData.roomTypes.split(',').map(s => s.trim())
        })
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {pkg ? 'Modifier l\'offre' : 'Nouvelle offre'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="romantic">Romantique</option>
                <option value="family">Famille</option>
                <option value="business">Business</option>
                <option value="wellness">Bien-être</option>
                <option value="adventure">Aventure</option>
                <option value="seasonal">Saisonnier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remise (%)</label>
              <input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="0" max="100" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix (€)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix original (€)</label>
              <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valide du</label>
              <input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valide jusqu'au</label>
              <input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity">
              {pkg ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
