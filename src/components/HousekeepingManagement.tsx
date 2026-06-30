'use client'

import { useState, useEffect } from 'react'
import { Broom, CheckCircle, Clock, AlertCircle, Users, Calendar, RefreshCw, Filter } from 'lucide-react'

interface HousekeepingTask {
  id: string
  roomId: string
  roomNumber: string
  roomType: string
  taskType: 'cleaning' | 'maintenance' | 'inspection' | 'special'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  assignedTo?: string
  assignedStaffName?: string
  scheduledTime: string
  completedTime?: string
  estimatedDuration: number
  notes?: string
  guestRequest?: string
}

interface HousekeepingManagementProps {
  userId?: string
}

export default function HousekeepingManagement({ userId }: HousekeepingManagementProps) {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/housekeeping', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches de ménage:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: HousekeepingTask['status']) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/housekeeping/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
    }
  }

  const assignTask = async (taskId: string, staffId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/housekeeping/${taskId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ staffId }),
      })

      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation de la tâche:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchTasks()
    setRefreshing(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'skipped':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé'
      case 'in_progress':
        return 'En cours'
      case 'pending':
        return 'En attente'
      case 'skipped':
        return 'Ignoré'
      default:
        return status
    }
  }

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'cleaning':
        return 'Nettoyage'
      case 'maintenance':
        return 'Maintenance'
      case 'inspection':
        return 'Inspection'
      case 'special':
        return 'Spécial'
      default:
        return type
    }
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (selectedStatus !== 'all' && task.status !== selectedStatus) return false
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false
      return true
    })
  }

  const calculateCompletionRate = () => {
    if (tasks.length === 0) return 0
    const completed = tasks.filter(t => t.status === 'completed').length
    return ((completed / tasks.length) * 100).toFixed(1)
  }

  const calculateAverageDuration = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedTime)
    if (completedTasks.length === 0) return 0
    const totalDuration = completedTasks.reduce((sum, task) => {
      const start = new Date(task.scheduledTime).getTime()
      const end = new Date(task.completedTime!).getTime()
      return sum + (end - start) / 60000 // Convert to minutes
    }, 0)
    return (totalDuration / completedTasks.length).toFixed(0)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Broom className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion du housekeeping</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const filteredTasks = getFilteredTasks()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Broom className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion du housekeeping</h3>
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
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Broom className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Tâches totales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.length}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Taux de complétion</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateCompletionRate()}%
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Durée moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateAverageDuration()} min
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">En cours</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.filter(t => t.status === 'in_progress').length}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          <div className="flex gap-1">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'in_progress' ? 'En cours' : 'Terminés'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-4">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setSelectedPriority(priority)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPriority === priority
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {priority === 'all' ? 'Toutes priorités' : priority === 'urgent' ? 'Urgent' : priority === 'high' ? 'Haute' : priority === 'medium' ? 'Moyenne' : 'Basse'}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Chambre {task.roomNumber}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'urgent' ? 'Urgent' : task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      {getTaskTypeLabel(task.taskType)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Type de chambre</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.roomType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Planifié</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(task.scheduledTime).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Durée estimée</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.estimatedDuration} min
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Assigné à</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.assignedStaffName || 'Non assigné'}
                      </p>
                    </div>
                  </div>
                  {task.guestRequest && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 mb-2">
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        <strong>Demande client:</strong> {task.guestRequest}
                      </p>
                    </div>
                  )}
                  {task.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Notes:</strong> {task.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Démarrer
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Terminer
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Complété</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Broom className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucune tâche trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}
