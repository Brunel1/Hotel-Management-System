'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Settings, X } from 'lucide-react'

interface NotificationPreferences {
  enabled: boolean
  bookingNotifications: boolean
  promotionNotifications: boolean
  reminderNotifications: boolean
  alertNotifications: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  soundEnabled: boolean
  vibrationEnabled: boolean
}

export default function PushNotificationManager() {
  const [mounted, setMounted] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    bookingNotifications: true,
    promotionNotifications: true,
    reminderNotifications: true,
    alertNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    soundEnabled: true,
    vibrationEnabled: true,
  })
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      
      // Charger les préférences depuis localStorage
      const userId = localStorage.getItem('userId')
      if (userId) {
        const stored = localStorage.getItem(`notification-preferences-${userId}`)
        if (stored) {
          setPreferences(JSON.parse(stored))
        }
      }
    }
  }, [])

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    const result = await Notification.requestPermission()
    setPermission(result)
  }

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] }
      
      const userId = localStorage.getItem('userId')
      if (userId) {
        localStorage.setItem(`notification-preferences-${userId}`, JSON.stringify(updated))
      }
      
      return updated
    })
  }

  const toggleQuietHours = () => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        quietHours: {
          ...prev.quietHours,
          enabled: !prev.quietHours.enabled,
        },
      }
      
      const userId = localStorage.getItem('userId')
      if (userId) {
        localStorage.setItem(`notification-preferences-${userId}`, JSON.stringify(updated))
      }
      
      return updated
    })
  }

  const updateQuietHours = (field: 'start' | 'end', value: string) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        quietHours: {
          ...prev.quietHours,
          [field]: value,
        },
      }
      
      const userId = localStorage.getItem('userId')
      if (userId) {
        localStorage.setItem(`notification-preferences-${userId}`, JSON.stringify(updated))
      }
      
      return updated
    })
  }

  if (!mounted || typeof window === 'undefined' || !('Notification' in window)) {
    return null
  }

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={permission === 'default' ? requestPermission : () => setShowSettings(!showSettings)}
        className={`p-2 rounded-lg transition-colors ${
          permission === 'granted'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : permission === 'denied'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 hover:text-indigo-600'
        }`}
        title={permission === 'granted' ? 'Notifications activées' : permission === 'denied' ? 'Notifications bloquées' : 'Activer les notifications'}
      >
        {permission === 'granted' ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      </button>

      {/* Panneau de paramètres */}
      {showSettings && permission === 'granted' && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Paramètres de notification</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Activation globale */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Activer les notifications</span>
              <button
                onClick={() => togglePreference('enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {preferences.enabled && (
              <>
                {/* Types de notifications */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Types de notifications</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Réservations</span>
                    <button
                      onClick={() => togglePreference('bookingNotifications')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.bookingNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.bookingNotifications ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Promotions</span>
                    <button
                      onClick={() => togglePreference('promotionNotifications')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.promotionNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.promotionNotifications ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Rappels</span>
                    <button
                      onClick={() => togglePreference('reminderNotifications')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.reminderNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.reminderNotifications ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alertes</span>
                    <button
                      onClick={() => togglePreference('alertNotifications')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.alertNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.alertNotifications ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Heures de calme */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Heures de calme</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Activer les heures de calme</span>
                    <button
                      onClick={toggleQuietHours}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.quietHours.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.quietHours.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {preferences.quietHours.enabled && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Début</label>
                        <input
                          type="time"
                          value={preferences.quietHours.start}
                          onChange={(e) => updateQuietHours('start', e.target.value)}
                          className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fin</label>
                        <input
                          type="time"
                          value={preferences.quietHours.end}
                          onChange={(e) => updateQuietHours('end', e.target.value)}
                          className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Son et vibration */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Options</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Son</span>
                    <button
                      onClick={() => togglePreference('soundEnabled')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.soundEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Vibration</span>
                    <button
                      onClick={() => togglePreference('vibrationEnabled')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.vibrationEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.vibrationEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
