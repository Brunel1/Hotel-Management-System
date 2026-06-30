'use client'

import { useState, useEffect } from 'react'
import { Users, Target, Mail, TrendingUp, Star, Filter, Search, MoreVertical, Crown, Award, Gem } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  segment: 'vip' | 'regular' | 'new' | 'inactive'
  loyaltyPoints: number
  totalBookings: number
  totalSpent: number
  lastBooking: Date
  preferences: string[]
  lifetimeValue: number
  riskScore: number
}

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  segment: string
  status: 'draft' | 'scheduled' | 'sent' | 'completed'
  sent: number
  opened: number
  clicked: number
  converted: number
  scheduledFor?: Date
}

export default function AdvancedCRM() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'customers' | 'segments' | 'campaigns'>('customers')
  const [selectedSegment, setSelectedSegment] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCRMData()
  }, [])

  const fetchCRMData = async () => {
    try {
      const [customersRes, campaignsRes] = await Promise.all([
        fetch('/api/crm/customers'),
        fetch('/api/crm/campaigns')
      ])
      const customersData = await customersRes.json()
      const campaignsData = await campaignsRes.json()
      setCustomers(customersData)
      setCampaigns(campaignsData)
    } catch (error) {
      console.error('Erreur lors du chargement CRM:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSegment && matchesSearch
  })

  const segmentIcons = {
    vip: <Crown className="w-5 h-5 text-yellow-500" />,
    regular: <Star className="w-5 h-5 text-blue-500" />,
    new: <Award className="w-5 h-5 text-green-500" />,
    inactive: <Gem className="w-5 h-5 text-gray-500" />
  }

  const segmentStats = {
    vip: customers.filter(c => c.segment === 'vip').length,
    regular: customers.filter(c => c.segment === 'regular').length,
    new: customers.filter(c => c.segment === 'new').length,
    inactive: customers.filter(c => c.segment === 'inactive').length
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Avancé</h2>
          <p className="text-gray-600 dark:text-gray-400">Gestion de la relation client et marketing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'customers'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Clients
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'segments'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Segments
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Campagnes
        </button>
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les segments</option>
              <option value="vip">VIP</option>
              <option value="regular">Réguliers</option>
              <option value="new">Nouveaux</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          {/* Customers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Segment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Réservations</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">LTV</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Points</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Risque</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {segmentIcons[customer.segment]}
                        <span className="capitalize text-sm text-gray-600 dark:text-gray-400">{customer.segment}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{customer.totalBookings}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{customer.totalSpent.toLocaleString()} €</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{customer.lifetimeValue.toLocaleString()} €</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{customer.loyaltyPoints}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        customer.riskScore < 30 ? 'text-green-600' : customer.riskScore < 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {customer.riskScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Segments Tab */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(segmentStats).map(([segment, count]) => (
              <div key={segment} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  {segmentIcons[segment as keyof typeof segmentIcons]}
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{segment}</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">clients</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Règles de segmentation</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">VIP</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">LTV > 10 000€ ou > 10 réservations</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Auto</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Régulier</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">3-10 réservations, LTV 2 000-10 000€</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Auto</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Nouveau</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1-2 réservations, inscrit < 30 jours</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Auto</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Gem className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Inactif</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pas de réservation > 6 mois</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Auto</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Campagnes marketing</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
              <Mail className="w-5 h-5" />
              Nouvelle campagne
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {campaign.type === 'email' && <Mail className="w-5 h-5 text-blue-500" />}
                    {campaign.type === 'sms' && <Mail className="w-5 h-5 text-green-500" />}
                    {campaign.type === 'push' && <Mail className="w-5 h-5 text-purple-500" />}
                    <h4 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h4>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Statut</span>
                    <span className={`font-medium ${
                      campaign.status === 'completed' ? 'text-green-600' : 
                      campaign.status === 'sent' ? 'text-blue-600' : 
                      campaign.status === 'scheduled' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Envoyés</span>
                    <span className="font-medium text-gray-900 dark:text-white">{campaign.sent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Ouverts</span>
                    <span className="font-medium text-gray-900 dark:text-white">{campaign.opened} ({campaign.sent > 0 ? Math.round(campaign.opened / campaign.sent * 100) : 0}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Cliqués</span>
                    <span className="font-medium text-gray-900 dark:text-white">{campaign.clicked} ({campaign.sent > 0 ? Math.round(campaign.clicked / campaign.sent * 100) : 0}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Convertis</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{campaign.converted} ({campaign.sent > 0 ? Math.round(campaign.converted / campaign.sent * 100) : 0}%)</span>
                  </div>
                </div>

                {campaign.scheduledFor && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Prévue pour {new Date(campaign.scheduledFor).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
