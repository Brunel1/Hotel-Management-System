import { NextRequest, NextResponse } from 'next/server'
import { getGlobalStatistics } from '@/lib/booking-history'

/**
 * Route API pour récupérer les statistiques globales (admin)
 * GET /api/admin/statistics
 */
export async function GET(request: NextRequest) {
  try {
    const statistics = await getGlobalStatistics()

    return NextResponse.json(statistics, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
