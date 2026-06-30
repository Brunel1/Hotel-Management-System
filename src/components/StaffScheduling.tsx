'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Users, Clock, Plus, Edit, Trash2, Filter, RefreshCw, UserCheck, UserX } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  role: 'reception' | 'housekeeping' | 'maintenance' | 'kitchen' | 'management' | 'security'
  email: string
  phone: string
  isActive: boolean
}

interface Shift {
  id: string
  staffId: string
  staffName: string
  staffRole: string
  date: string
  startTime: string
  endTime: string
  shiftType: 'morning' | 'afternoon' | 'evening' | 'night'
  location: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'absent' | 'late'
  notes?: string
}

interface StaffSchedulingProps {
  userId?: string
}

export default function StaffScheduling({ userId }: StaffSchedulingProps) {
  const [loading, setLoading] = useState(true)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [selectedRole, setSelectedRole] = useState<'all' | 'reception' | 'housekeeping' | 'maintenance' | 'kitchen' | 'management' | 'security'>('all')

  useEffect(() => {
    fetchData()
  }, [selectedWeek])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const weekStart = new Date(selectedWeek)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const [shiftsResponse, staffResponse] = await Promise.all([
        fetch(`/api/admin/staff-scheduling?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/admin/staff', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      if (shiftsResponse.ok) {
        const shiftsData = await shiftsResponse.json()
        setShifts(shiftsData)
      }

      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        setStaff(staffData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const createShift = async (shiftData: Partial<Shift>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/staff-scheduling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(shiftData),
      })

      if (response.ok) {
        await fetchData()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création du quart:', error)
    }
  }

  const updateShift = async (shiftId: string, updates: Partial<Shift>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/staff-scheduling/${shiftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du quart:', error)
    }
  }

  const deleteShift = async (shiftId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/staff-scheduling/${shiftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du quart:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'afternoon':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'evening':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'night':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getShiftTypeLabel = (type: string) => {
    switch (type) {
      case 'morning':
        return 'Matin'
      case 'afternoon':
        return 'Après-midi'
      case 'evening':
        return 'Soir'
      case 'night':
        return 'Nuit'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'in_progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'reception':
        return 'Réception'
      case 'housekeeping':
        return 'Ménage'
      case 'maintenance':
        return 'Maintenance'
      case 'kitchen':
        return 'Cuisine'
      case 'management':
        return 'Management'
      case 'security':
        return 'Sécurité'
      default:
        return role
    }
  }

  const getWeekDays = () => {
    const weekStart = new Date(selectedWeek)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getShiftsForDay = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0]
    return shifts.filter(shift => shift.date.startsWith(dayStr))
  }

  const getFilteredShifts = () => {
    if (selectedRole === 'all') return shifts
    return shifts.filter(shift => shift.staffRole === selectedRole)
  }

  const calculateTotalHours = () => {
    return shifts.reduce((sum, shift) => {
      const start = new Date(`${shift.date}T${shift.startTime}`).getTime()
      const end = new Date(`${shift.date}T${shift.endTime}`).getTime()
      return sum + (end - start) / (1000 * 60 * 60)
    }, 0)
  }

  const getActiveStaffCount = () => {
    return staff.filter(s => s.isActive).length
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Planning du personnel</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const weekDays = getWeekDays()
  const filteredShifts = getFilteredShifts()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Planning du personnel</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newWeek = new Date(selectedWeek)
                newWeek.setDate(newWeek.getDate() - 7)
                setSelectedWeek(newWeek)
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Semaine précédente"
            >
              <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setSelectedWeek(new Date())}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => {
                const newWeek = new Date(selectedWeek)
                newWeek.setDate(newWeek.getDate() + 7)
                setSelectedWeek(newWeek)
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Semaine suivante"
            >
              <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
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
              Nouveau quart
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Personnel actif</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {getActiveStaffCount()}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Heures cette semaine</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateTotalHours().toFixed(0)}h
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Quarts planifiés</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {shifts.filter(s => s.status === 'scheduled').length}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserX className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Absences</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {shifts.filter(s => s.status === 'absent').length}
            </p>
          </div>
        </div>

        {/* Filtres par rôle */}
        <div className="flex gap-2 mb-6">
          {(['all', 'reception', 'housekeeping', 'maintenance', 'kitchen', 'management', 'security'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedRole === role
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {role === 'all' ? 'Tous' : getRoleLabel(role)}
            </button>
          ))}
        </div>

        {/* Calendrier hebdomadaire */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-2">
              {/* En-têtes de colonnes */}
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-gray-900 dark:text-white text-sm">
                Personnel
              </div>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-gray-900 dark:text-white text-sm text-center">
                  <div>{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                  <div>{day.getDate()}/{day.getMonth() + 1}</div>
                </div>
              ))}

              {/* Lignes du personnel */}
              {staff.filter(s => s.isActive).map((staffMember) => (
                <div key={staffMember.id} className="contents">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-white">
                    {staffMember.name}
                    <div className="text-xs text-gray-500 dark:text-gray-400">{getRoleLabel(staffMember.role)}</div>
                  </div>
                  {weekDays.map((day) => {
                    const dayShifts = getShiftsForDay(day).filter(s => s.staffId === staffMember.id)
                    return (
                      <div key={`${staffMember.id}-${day.toISOString()}`} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[80px]">
                        {dayShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={`p-2 rounded-lg mb-1 text-xs ${getShiftTypeColor(shift.shiftType)} cursor-pointer hover:opacity-80`}
                            onClick={() => updateShift(shift.id, { status: shift.status === 'completed' ? 'scheduled' : 'completed' })}
                          >
                            <div className="font-medium">{getShiftTypeLabel(shift.shiftType)}</div>
                            <div>{shift.startTime} - {shift.endTime}</div>
                            <div>{shift.location}</div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Liste détaillée des quarts */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Quarts de cette semaine</h4>
          <div className="space-y-2">
            {filteredShifts.slice(0, 10).map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getShiftTypeColor(shift.shiftType)}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {shift.staffName} - {getShiftTypeLabel(shift.shiftType)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(shift.date).toLocaleDateString('fr-FR')} • {shift.startTime} - {shift.endTime} • {shift.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shift.status)}`}>
                    {shift.status === 'scheduled' ? 'Planifié' : shift.status === 'in_progress' ? 'En cours' : shift.status === 'completed' ? 'Terminé' : shift.status === 'absent' ? 'Absent' : 'Retard'}
                  </span>
                  <button
                    onClick={() => deleteShift(shift.id)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredShifts.length > 10 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Affichage des 10 premiers quarts sur {filteredShifts.length}
            </p>
          )}
        </div>
      </div>

      {/* Modal de création (simplifié) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouveau quart</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le formulaire de création de quart sera implémenté avec les champs nécessaires.
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
                  createShift({
                    staffId: staff[0]?.id || '',
                    staffName: staff[0]?.name || 'Staff',
                    staffRole: staff[0]?.role || 'reception',
                    date: new Date().toISOString(),
                    startTime: '08:00',
                    endTime: '16:00',
                    shiftType: 'morning',
                    location: 'Réception',
                    status: 'scheduled',
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
