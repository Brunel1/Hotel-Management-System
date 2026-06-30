'use client'

import { useState, useEffect } from 'react'
import { Wrench, AlertTriangle, CheckCircle, Clock, Plus, Edit, Trash2, Filter, Calendar, User } from 'lucide-react'

interface MaintenanceTicket {
  id: string
  title: string
  description: string
  location: string
  category: 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'cosmetic' | 'equipment' | 'other'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'pending_parts' | 'resolved' | 'closed'
  reportedBy: string
  assignedTo?: string
  assignedStaffName?: string
  reportedAt: string
  resolvedAt?: string
  estimatedCost?: number
  actualCost?: number
  images?: string[]
  notes?: string
}

interface MaintenanceTicketsProps {
  userId?: string
}

export default function MaintenanceTickets({ userId }: MaintenanceTicketsProps) {
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'cosmetic' | 'equipment' | 'other'>('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/maintenance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tickets de maintenance:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async (ticketData: Partial<MaintenanceTicket>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      })

      if (response.ok) {
        await fetchTickets()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error)
    }
  }

  const updateTicket = async (ticketId: string, updates: Partial<MaintenanceTicket>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/maintenance/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchTickets()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du ticket:', error)
    }
  }

  const deleteTicket = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/maintenance/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchTickets()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du ticket:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending_parts':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Ouvert'
      case 'in_progress':
        return 'En cours'
      case 'pending_parts':
        return 'En attente pièces'
      case 'resolved':
        return 'Résolu'
      case 'closed':
        return 'Fermé'
      default:
        return status
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'plumbing':
        return 'Plomberie'
      case 'electrical':
        return 'Électricité'
      case 'hvac':
        return 'CVC'
      case 'structural':
        return 'Structure'
      case 'cosmetic':
        return 'Cosmétique'
      case 'equipment':
        return 'Équipement'
      case 'other':
        return 'Autre'
      default:
        return category
    }
  }

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      if (selectedStatus !== 'all' && ticket.status !== selectedStatus) return false
      if (selectedCategory !== 'all' && ticket.category !== selectedCategory) return false
      return true
    })
  }

  const calculateAverageResolutionTime = () => {
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' && t.resolvedAt)
    if (resolvedTickets.length === 0) return 0
    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      const reported = new Date(ticket.reportedAt).getTime()
      const resolved = new Date(ticket.resolvedAt!).getTime()
      return sum + (resolved - reported) / (1000 * 60 * 60 * 24) // Convert to days
    }, 0)
    return (totalTime / resolvedTickets.length).toFixed(1)
  }

  const calculateTotalCost = () => {
    return tickets.reduce((sum, ticket) => sum + (ticket.actualCost || ticket.estimatedCost || 0), 0)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const filteredTickets = getFilteredTickets()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouveau ticket
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Tickets ouverts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'pending_parts').length}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Résolus</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Temps moyen</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateAverageResolutionTime()}j
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Coût total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateTotalCost().toLocaleString('fr-FR')}€
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          <div className="flex gap-1">
            {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'Tous' : status === 'open' ? 'Ouverts' : status === 'in_progress' ? 'En cours' : status === 'resolved' ? 'Résolus' : 'Fermés'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-4">
            {(['all', 'plumbing', 'electrical', 'hvac', 'structural', 'cosmetic', 'equipment', 'other'] as const).map((category) => (
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
        </div>

        {/* Liste des tickets */}
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {ticket.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority === 'critical' ? 'Critique' : ticket.priority === 'high' ? 'Haute' : ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Localisation</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {ticket.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Signalé par</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {ticket.reportedBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Assigné à</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {ticket.assignedStaffName || 'Non assigné'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Signalé le</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(ticket.reportedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {(ticket.estimatedCost || ticket.actualCost) && (
                    <div className="flex gap-4 text-sm">
                      {ticket.estimatedCost && (
                        <span className="text-gray-600 dark:text-gray-400">
                          Estimé: {ticket.estimatedCost}€
                        </span>
                      )}
                      {ticket.actualCost && (
                        <span className="text-gray-600 dark:text-gray-400">
                          Réel: {ticket.actualCost}€
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteTicket(ticket.id)}
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

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aucun ticket de maintenance</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Créer un ticket
            </button>
          </div>
        )}
      </div>

      {/* Modal de création (simplifié) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouveau ticket de maintenance</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le formulaire de création de ticket sera implémenté avec les champs nécessaires.
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
                  createTicket({
                    title: 'Nouveau ticket de maintenance',
                    description: 'Description du problème',
                    location: 'Chambre 101',
                    category: 'other',
                    priority: 'medium',
                    status: 'open',
                    reportedBy: 'Admin',
                    reportedAt: new Date().toISOString(),
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
