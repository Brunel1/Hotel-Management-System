'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, TrendingDown, TrendingUp, Plus, Edit, Trash2, RefreshCw, Filter, ShoppingCart } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: 'housekeeping' | 'food_beverage' | 'amenities' | 'maintenance' | 'office' | 'other'
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  reorderQuantity: number
  unit: string
  unitCost: number
  supplier?: string
  location: string
  lastRestocked?: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked'
}

interface InventoryManagementProps {
  userId?: string
}

export default function InventoryManagement({ userId }: InventoryManagementProps) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'housekeeping' | 'food_beverage' | 'amenities' | 'maintenance' | 'office' | 'other'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked'>('all')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error)
    } finally {
      setLoading(false)
    }
  }

  const createItem = async (itemData: Partial<InventoryItem>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(itemData),
      })

      if (response.ok) {
        await fetchInventory()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error)
    }
  }

  const updateItem = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchInventory()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error)
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchInventory()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error)
    }
  }

  const restockItem = async (itemId: string, quantity: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/inventory/${itemId}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      })

      if (response.ok) {
        await fetchInventory()
      }
    } catch (error) {
      console.error('Erreur lors du réapprovisionnement:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchInventory()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'overstocked':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'En stock'
      case 'low_stock':
        return 'Stock faible'
      case 'out_of_stock':
        return 'Rupture'
      case 'overstocked':
        return 'Surstock'
      default:
        return status
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'housekeeping':
        return 'Ménage'
      case 'food_beverage':
        return 'Nourriture/Boisson'
      case 'amenities':
        return 'Équipements'
      case 'maintenance':
        return 'Maintenance'
      case 'office':
        return 'Bureau'
      case 'other':
        return 'Autre'
      default:
        return category
    }
  }

  const getFilteredItems = () => {
    return items.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false
      return true
    })
  }

  const calculateTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
  }

  const getLowStockItems = () => {
    return items.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
  }

  const getOverstockedItems = () => {
    return items.filter(item => item.status === 'overstocked')
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion des stocks</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion des stocks</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              <Plus className="w-5 h-5" />
              Nouvel article
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total articles</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {items.length}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Valeur totale</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateTotalValue().toLocaleString('fr-FR')}€
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Stock faible</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {getLowStockItems().length}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Surstock</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {getOverstockedItems().length}
            </p>
          </div>
        </div>

        {/* Alertes de stock */}
        {getLowStockItems().length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">Alertes de stock</h4>
            </div>
            <div className="space-y-1">
              {getLowStockItems().slice(0, 3).map(item => (
                <div key={item.id} className="text-sm text-yellow-700 dark:text-yellow-500">
                  {item.name} - {item.currentStock} {item.unit} (min: {item.minStock} {item.unit})
                </div>
              ))}
              {getLowStockItems().length > 3 && (
                <div className="text-sm text-yellow-700 dark:text-yellow-500">
                  +{getLowStockItems().length - 3} autres articles
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          <div className="flex gap-1">
            {(['all', 'housekeeping', 'food_beverage', 'amenities', 'maintenance', 'office', 'other'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category === 'all' ? 'Toutes' : getCategoryLabel(category)}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-4">
            {(['all', 'in_stock', 'low_stock', 'out_of_stock', 'overstocked'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'Tous' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des articles */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    SKU: {item.sku} • {item.location}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Stock actuel</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.currentStock} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Stock min</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.minStock} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Stock max</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.maxStock} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Coût unitaire</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.unitCost}€
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Valeur</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {(item.currentStock * item.unitCost).toLocaleString('fr-FR')}€
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {item.supplier && (
                      <span>Fournisseur: {item.supplier}</span>
                    )}
                    {item.lastRestocked && (
                      <span>Dernier réapprovisionnement: {new Date(item.lastRestocked).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {item.status === 'low_stock' || item.status === 'out_of_stock' ? (
                    <button
                      onClick={() => restockItem(item.id, item.reorderQuantity)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Réapprovisionner
                    </button>
                  ) : null}
                  <button
                    onClick={() => updateItem(item.id, { currentStock: item.currentStock + 1 })}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Ajouter 1"
                  >
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    onClick={() => updateItem(item.id, { currentStock: Math.max(0, item.currentStock - 1) })}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Retirer 1"
                  >
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
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

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aucun article dans l'inventaire</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Ajouter un article
            </button>
          </div>
        )}
      </div>

      {/* Modal de création (simplifié) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouvel article</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le formulaire de création d'article sera implémenté avec les champs nécessaires.
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
                  createItem({
                    name: 'Nouvel article',
                    sku: 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                    category: 'other',
                    currentStock: 10,
                    minStock: 5,
                    maxStock: 50,
                    reorderPoint: 5,
                    reorderQuantity: 20,
                    unit: 'unité',
                    unitCost: 10,
                    location: 'Entrepôt',
                    status: 'in_stock',
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
