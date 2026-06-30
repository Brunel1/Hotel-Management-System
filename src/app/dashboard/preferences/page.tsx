'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { Save, ArrowLeft, Heart, Settings, Bell, Globe, CreditCard } from 'lucide-react'

export default function PreferencesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [preferences, setPreferences] = useState({
    preferredRoomType: '',
    preferredFloor: '',
    preferredView: '',
    dietaryRestrictions: '',
    languagePreference: 'fr',
    currencyPreference: 'EUR',
    notificationPreferences: 'all',
    specialRequests: '',
    bedType: '',
    smokingPreference: '',
  })

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth/login')
          return
        }

        const response = await fetch('/api/user/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setPreferences(prev => ({
            ...prev,
            ...data,
            preferredFloor: data.preferredFloor?.toString() || '',
            preferredRoomType: data.preferredRoomType || '',
            preferredView: data.preferredView || '',
            dietaryRestrictions: data.dietaryRestrictions || '',
            languagePreference: data.languagePreference || 'fr',
            currencyPreference: data.currencyPreference || 'EUR',
            notificationPreferences: data.notificationPreferences || 'all',
            specialRequests: data.specialRequests || '',
            bedType: data.bedType || '',
            smokingPreference: data.smokingPreference || '',
          }))
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPreferences(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...preferences,
          preferredFloor: preferences.preferredFloor ? parseInt(preferences.preferredFloor) : null,
        }),
      })

      if (response.ok) {
        setMessage('Préférences enregistrées avec succès!')
      } else {
        setMessage('Erreur lors de l\'enregistrement des préférences')
      }
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement des préférences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* En-tête */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes préférences</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('succès') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Préférences de chambre */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Préférences de chambre</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="preferredRoomType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de chambre préféré
                </label>
                <select
                  id="preferredRoomType"
                  name="preferredRoomType"
                  value={preferences.preferredRoomType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Aucune préférence</option>
                  <option value="STANDARD">Standard</option>
                  <option value="SUPERIOR">Supérieure</option>
                  <option value="SUITE">Suite</option>
                  <option value="DELUXE">Deluxe</option>
                  <option value="FAMILY">Familiale</option>
                </select>
              </div>

              <div>
                <label htmlFor="preferredFloor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Étage préféré
                </label>
                <input
                  id="preferredFloor"
                  name="preferredFloor"
                  type="number"
                  min="0"
                  value={preferences.preferredFloor}
                  onChange={handleChange}
                  placeholder="Ex: 2"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="preferredView" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vue préférée
                </label>
                <select
                  id="preferredView"
                  name="preferredView"
                  value={preferences.preferredView}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Aucune préférence</option>
                  <option value="SEA">Vue sur mer</option>
                  <option value="CITY">Vue sur ville</option>
                  <option value="GARDEN">Vue sur jardin</option>
                  <option value="MOUNTAIN">Vue sur montagne</option>
                </select>
              </div>

              <div>
                <label htmlFor="bedType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de lit préféré
                </label>
                <select
                  id="bedType"
                  name="bedType"
                  value={preferences.bedType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Aucune préférence</option>
                  <option value="SINGLE">Lit simple</option>
                  <option value="DOUBLE">Lit double</option>
                  <option value="TWIN">Lits jumeaux</option>
                  <option value="KING">Lit king size</option>
                  <option value="QUEEN">Lit queen size</option>
                </select>
              </div>

              <div>
                <label htmlFor="smokingPreference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Préférence fumeur
                </label>
                <select
                  id="smokingPreference"
                  name="smokingPreference"
                  value={preferences.smokingPreference}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Aucune préférence</option>
                  <option value="SMOKING">Fumeur</option>
                  <option value="NON_SMOKING">Non-fumeur</option>
                </select>
              </div>
            </div>
          </div>

          {/* Préférences alimentaires */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Préférences alimentaires</h2>
            </div>

            <div>
              <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Restrictions alimentaires
              </label>
              <textarea
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={preferences.dietaryRestrictions}
                onChange={handleChange}
                rows={3}
                placeholder="Ex: Végétarien, sans gluten, allergies aux noix..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Préférences de langue et devise */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Langue et devise</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="languagePreference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Langue préférée
                </label>
                <select
                  id="languagePreference"
                  name="languagePreference"
                  value={preferences.languagePreference}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                </select>
              </div>

              <div>
                <label htmlFor="currencyPreference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Devise préférée
                </label>
                <select
                  id="currencyPreference"
                  name="currencyPreference"
                  value={preferences.currencyPreference}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar américain ($)</option>
                  <option value="GBP">Livre sterling (£)</option>
                  <option value="CHF">Franc suisse (CHF)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Préférences de notification */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>

            <div>
              <label htmlFor="notificationPreferences" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Préférences de notification
              </label>
              <select
                id="notificationPreferences"
                name="notificationPreferences"
                value={preferences.notificationPreferences}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Toutes les notifications</option>
                <option value="important">Notifications importantes uniquement</option>
                <option value="none">Aucune notification</option>
              </select>
            </div>
          </div>

          {/* Demandes spéciales */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Demandes spéciales</h2>
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Demandes spéciales par défaut
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={preferences.specialRequests}
                onChange={handleChange}
                rows={3}
                placeholder="Ex: Chambre calme, loin de l'ascenseur, serviettes supplémentaires..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
