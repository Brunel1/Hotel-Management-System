'use client'

import { useState, useEffect } from 'react'
import { Shield, Smartphone, CheckCircle, XCircle, Copy, RefreshCw } from 'lucide-react'

interface TwoFactorAuthProps {
  userId: string
  onSetupComplete?: () => void
}

export default function TwoFactorAuth({ userId, onSetupComplete }: TwoFactorAuthProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    check2FAStatus()
  }, [userId])

  const check2FAStatus = async () => {
    try {
      const response = await fetch(`/api/auth/2fa/status?userId=${userId}`)
      const data = await response.json()
      setIsEnabled(data.enabled)
    } catch (error) {
      console.error('Erreur lors de la vérification du statut 2FA:', error)
    }
  }

  const setup2FA = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setIsSetupMode(true)
      }
    } catch (error) {
      setError('Impossible de configurer la 2FA')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: verificationCode, secret })
      })
      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setIsEnabled(true)
        setIsSetupMode(false)
        setTimeout(() => {
          setSuccess(false)
          onSetupComplete?.()
        }, 2000)
      } else {
        setError('Code invalide')
      }
    } catch (error) {
      setError('Erreur lors de la vérification')
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver la 2FA ? Cela réduira la sécurité de votre compte.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await response.json()

      if (data.success) {
        setIsEnabled(false)
      } else {
        setError(data.error || 'Impossible de désactiver la 2FA')
      }
    } catch (error) {
      setError('Erreur lors de la désactivation')
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          2FA activée avec succès !
        </h3>
        <p className="text-green-700 dark:text-green-300">
          Votre compte est maintenant protégé par l'authentification à deux facteurs.
        </p>
      </div>
    )
  }

  if (isSetupMode) {
    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
            Configurez votre application d'authentification
          </h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Scannez ce QR code avec Google Authenticator, Authy ou une autre application TOTP.
          </p>
        </div>

        {qrCode && (
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img src={qrCode} alt="QR Code pour 2FA" className="w-48 h-48" />
            </div>
          </div>
        )}

        {secret && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Code secret (au cas où vous ne pouvez pas scanner)
              </span>
              <button
                onClick={copySecret}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <code className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block">
              {secret}
            </code>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Entrez le code à 6 chiffres
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
            maxLength={6}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setIsSetupMode(false)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={verifyAndEnable}
            disabled={loading || verificationCode.length !== 6}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Activer la 2FA
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${isEnabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <Shield className={`w-6 h-6 ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Authentification à deux facteurs
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isEnabled ? 'La 2FA est activée sur votre compte' : 'Ajoutez une couche de sécurité supplémentaire'}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isEnabled 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {isEnabled ? 'Activée' : 'Désactivée'}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Comment ça marche ?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Téléchargez une app d'authentification (Google Authenticator, Authy...)</li>
              <li>Scannez le QR code qui apparaîtra</li>
              <li>Entrez le code à 6 chiffres pour confirmer</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {!isEnabled ? (
          <button
            onClick={setup2FA}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Activer la 2FA
              </>
            )}
          </button>
        ) : (
          <button
            onClick={disable2FA}
            disabled={loading}
            className="flex-1 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                Désactivation...
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Désactiver la 2FA
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
