'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Home, Download, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState<string | null>(null)

  useEffect(() => {
    const booking = searchParams.get('bookingId')
    setBookingId(booking)
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Paiement réussi !
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Votre réservation a été confirmée avec succès.
            </p>
          </div>

          {/* Booking Details */}
          {bookingId && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Numéro de réservation
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bookingId}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Voir mes réservations
            </Link>

            <Link
              href="/"
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>

            <button
              onClick={() => window.print()}
              className="w-full text-indigo-600 dark:text-indigo-400 py-3 px-6 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Télécharger la facture
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Un email de confirmation a été envoyé à votre adresse.</p>
            <p className="mt-1">Pour toute question, contactez-nous par téléphone ou email.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
