'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Calendar, Users, TrendingUp, Plus, Edit, Trash2, Play, Pause } from 'lucide-react'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  type: 'welcome' | 'booking' | 'reminder' | 'promotion' | 'review' | 'loyalty'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduledDate?: string
  sentDate?: string
  targetAudience: {
    segment: 'all' | 'guests' | 'vip' | 'inactive' | 'new'
    count: number
  }
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
  }
  template: string
}

interface EmailCampaignsProps {
  userId?: string
}

export default function EmailCampaigns({ userId }: EmailCampaignsProps) {
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/email-campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async (campaignData: Partial<EmailCampaign>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(campaignData),
      })

      if (response.ok) {
        await fetchCampaigns()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error)
    }
  }

  const updateCampaign = async (campaignId: string, updates: Partial<EmailCampaign>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/email-campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchCampaigns()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la campagne:', error)
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/email-campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchCampaigns()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la campagne:', error)
    }
  }

  const toggleCampaignStatus = async (campaign: EmailCampaign) => {
    const newStatus = campaign.status === 'paused' ? 'scheduled' : 'paused'
    await updateCampaign(campaign.id, { status: newStatus })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'sending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'paused':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon'
      case 'scheduled':
        return 'Programmée'
      case 'sending':
        return 'Envoi en cours'
      case 'sent':
        return 'Envoyée'
      case 'paused':
        return 'En pause'
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'Bienvenue'
      case 'booking':
        return 'Réservation'
      case 'reminder':
        return 'Rappel'
      case 'promotion':
        return 'Promotion'
      case 'review':
        return 'Avis'
      case 'loyalty':
        return 'Fidélité'
      default:
        return type
    }
  }

  const calculateOpenRate = (metrics: EmailCampaign['metrics']) => {
    if (metrics.sent === 0) return 0
    return ((metrics.opened / metrics.sent) * 100).toFixed(1)
  }

  const calculateClickRate = (metrics: EmailCampaign['metrics']) => {
    if (metrics.sent === 0) return 0
    return ((metrics.clicked / metrics.sent) * 100).toFixed(1)
  }

  const calculateDeliveryRate = (metrics: EmailCampaign['metrics']) => {
    if (metrics.sent === 0) return 0
    return ((metrics.delivered / metrics.sent) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campagnes email</h3>
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
            <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campagnes email</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouvelle campagne
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Emails envoyés</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {campaigns.reduce((sum, c) => sum + c.metrics.sent, 0).toLocaleString('fr-FR')}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Taux d'ouverture</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {campaigns.length > 0 
                ? (campaigns.reduce((sum, c) => sum + parseFloat(calculateOpenRate(c.metrics)), 0) / campaigns.length).toFixed(1)
                : 0}%
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Taux de clic</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {campaigns.length > 0
                ? (campaigns.reduce((sum, c) => sum + parseFloat(calculateClickRate(c.metrics)), 0) / campaigns.length).toFixed(1)
                : 0}%
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Campagnes actives</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {campaigns.filter(c => c.status === 'scheduled' || c.status === 'sending').length}
            </p>
          </div>
        </div>

        {/* Liste des campagnes */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {campaign.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      {getTypeLabel(campaign.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {campaign.subject}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Public cible</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.targetAudience.count} contacts
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Livraison</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {calculateDeliveryRate(campaign.metrics)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ouverture</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {calculateOpenRate(campaign.metrics)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Clic</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {calculateClickRate(campaign.metrics)}%
                      </p>
                    </div>
                  </div>

                  {campaign.scheduledDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Programmée pour le {new Date(campaign.scheduledDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {campaign.sentDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Envoyée le {new Date(campaign.sentDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  {(campaign.status === 'scheduled' || campaign.status === 'paused') && (
                    <button
                      onClick={() => toggleCampaignStatus(campaign)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={campaign.status === 'paused' ? 'Reprendre' : 'Pause'}
                    >
                      {campaign.status === 'paused' ? (
                        <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Pause className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
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

        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aucune campagne email créée</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Créer une campagne
            </button>
          </div>
        )}
      </div>

      {/* Modal de création (simplifié) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouvelle campagne email</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le formulaire de création de campagne sera implémenté avec les champs nécessaires.
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
                  createCampaign({
                    name: 'Nouvelle campagne',
                    subject: 'Sujet de l\'email',
                    type: 'promotion',
                    status: 'draft',
                    targetAudience: {
                      segment: 'all',
                      count: 0,
                    },
                    metrics: {
                      sent: 0,
                      delivered: 0,
                      opened: 0,
                      clicked: 0,
                      bounced: 0,
                    },
                    template: 'default',
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
