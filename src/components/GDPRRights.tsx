'use client'

import { useState } from 'react'
import { Download, Trash, FileText, Lock, AlertCircle, CheckCircle, Send } from 'lucide-react'

export default function GDPRRights() {
  const [activeTab, setActiveTab] = useState<'access' | 'delete' | 'export' | 'rectify'>('access')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleRequest = async (type: string) => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/gdpr/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Vos droits RGPD
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Conformément au RGPD, vous avez des droits sur vos données personnelles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('access')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'access'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Droit d'accès
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Portabilité
        </button>
        <button
          onClick={() => setActiveTab('rectify')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'rectify'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Rectification
        </button>
        <button
          onClick={() => setActiveTab('delete')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'delete'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Suppression
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'access' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Droit d'accès
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Vous avez le droit de demander une copie de toutes les données personnelles que nous détenons sur vous.
                </p>
                <button
                  onClick={() => handleRequest('access')}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Demander mes données
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Droit à la portabilité
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Vous pouvez demander à recevoir vos données dans un format structuré couramment utilisé.
                </p>
                <button
                  onClick={() => handleRequest('export')}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Exportation...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exporter mes données
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rectify' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Lock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Droit de rectification
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Vous pouvez demander la correction de données inexactes ou incomplètes.
                </p>
                <textarea
                  placeholder="Décrivez les données à corriger..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                />
                <button
                  onClick={() => handleRequest('rectify')}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer la demande
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delete' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Trash className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Droit à l'effacement
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Vous pouvez demander la suppression de vos données personnelles. Cette action est irréversible.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <p className="font-medium mb-1">Attention</p>
                      <p>
                        La suppression de votre compte entraînera la perte de toutes vos réservations, préférences et historique.
                        Cette action ne peut pas être annulée.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.')) {
                      handleRequest('delete')
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash className="w-4 h-4" />
                      Supprimer mes données
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note :</strong> Toutes les demandes seront traitées dans un délai de 30 jours conformément au RGPD.
          Vous recevrez une confirmation par email.
        </p>
      </div>
    </div>
  )
}
