'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Users, DollarSign, Bed, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface KPICard {
  title: string
  value: string
  change: number
  changeType: 'positive' | 'negative'
  icon: React.ReactNode
}

interface BookingData {
  date: string
  bookings: number
  revenue: number
}

interface ChannelData {
  name: string
  bookings: number
  revenue: number
  percentage: number
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [kpis, setKPIs] = useState<KPICard[]>([])
  const [bookingData, setBookingData] = useState<BookingData[]>([])
  const [channelData, setChannelData] = useState<ChannelData[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${dateRange}`)
      const data = await response.json()
      setKPIs(data.kpis)
      setBookingData(data.bookings)
      setChannelData(data.channels)
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble des performances de l'hôtel</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">Dernière année</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Réservations et Revenus
          </h3>
          <BookingChart data={bookingData} />
        </div>

        {/* Channels Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Canaux de réservation
          </h3>
          <ChannelChart data={channelData} />
        </div>
      </div>

      {/* Room Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance des chambres
        </h3>
        <RoomPerformanceTable />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activité récente
        </h3>
        <RecentActivity />
      </div>
    </div>
  )
}

function KPICard({ title, value, change, changeType, icon }: KPICard) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {changeType === 'positive' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
    </div>
  )
}

function BookingChart({ data }: { data: BookingData[] }) {
  const maxValue = Math.max(...data.map(d => d.bookings))
  
  return (
    <div className="h-64 flex items-end gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg transition-all hover:opacity-80"
            style={{ height: `${(item.bookings / maxValue) * 100}%` }}
            title={`${item.bookings} réservations`}
          />
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChannelChart({ data }: { data: ChannelData[] }) {
  return (
    <div className="space-y-4">
      {data.map((channel, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{channel.name}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{channel.percentage}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all"
              style={{ width: `${channel.percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{channel.bookings} réservations</span>
            <span>{channel.revenue.toLocaleString()} €</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function RoomPerformanceTable() {
  const rooms = [
    { number: '101', type: 'Standard', occupancy: 85, revenue: 4250, adr: 50 },
    { number: '102', type: 'Standard', occupancy: 78, revenue: 3900, adr: 50 },
    { number: '201', type: 'Supérieure', occupancy: 92, revenue: 7360, adr: 80 },
    { number: '202', type: 'Supérieure', occupancy: 88, revenue: 7040, adr: 80 },
    { number: '301', type: 'Suite', occupancy: 75, revenue: 11250, adr: 150 },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Chambre</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Type</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Occupation</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Revenu</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">ADR</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{room.number}</td>
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{room.type}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        room.occupancy >= 80 ? 'bg-green-500' : room.occupancy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${room.occupancy}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{room.occupancy}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{room.revenue.toLocaleString()} €</td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{room.adr} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecentActivity() {
  const activities = [
    { type: 'booking', message: 'Nouvelle réservation - Chambre 201', time: 'Il y a 5 minutes' },
    { type: 'checkin', message: 'Check-in - M. Dupont (Chambre 102)', time: 'Il y a 15 minutes' },
    { type: 'checkout', message: 'Check-out - Mme Martin (Chambre 301)', time: 'Il y a 30 minutes' },
    { type: 'payment', message: 'Paiement reçu - 250 €', time: 'Il y a 45 minutes' },
    { type: 'review', message: 'Nouvel avis - 5 étoiles', time: 'Il y a 1 heure' },
  ]

  const icons = {
    booking: <Calendar className="w-4 h-4 text-blue-500" />,
    checkin: <Users className="w-4 h-4 text-green-500" />,
    checkout: <Users className="w-4 h-4 text-orange-500" />,
    payment: <DollarSign className="w-4 h-4 text-green-500" />,
    review: <TrendingUp className="w-4 h-4 text-purple-500" />,
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
            {icons[activity.type as keyof typeof icons]}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
