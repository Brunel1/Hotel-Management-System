import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { getUserBookingHistory, getUserStatistics } from '@/lib/booking-history'

/**
 * Route API pour récupérer l'historique des réservations de l'utilisateur
 * GET /api/bookings/history
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const searchParams = request.nextUrl.searchParams
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const statistics = await getUserStatistics(userId)
      return NextResponse.json(statistics, { status: 200 })
    }

    const bookings = await getUserBookingHistory(userId)

    return NextResponse.json(bookings, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération de l&apos;historique:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l&apos;historique' },
      { status: 500 }
    )
  }
}
