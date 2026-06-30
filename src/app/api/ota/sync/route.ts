import { NextRequest, NextResponse } from 'next/server'
import { otaSyncService } from '@/lib/ota-sync'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour la synchronisation OTA
 * POST /api/ota/sync - Synchroniser les données avec les OTA
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions (seuls les admins peuvent synchroniser)
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type } = body

    let result

    switch (type) {
      case 'bookings':
        result = await otaSyncService.syncAllBookings()
        break
      case 'availability':
        result = await otaSyncService.syncAllAvailability()
        break
      case 'all':
        const bookings = await otaSyncService.syncAllBookings()
        const availability = await otaSyncService.syncAllAvailability()
        result = { bookings, availability }
        break
      default:
        return NextResponse.json(
          { error: 'Type de synchronisation invalide' },
          { status: 400 }
        )
    }

    return NextResponse.json(
      { message: 'Synchronisation effectuée avec succès', result },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la synchronisation OTA:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la synchronisation OTA' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ota/sync - Obtenir le statut de synchronisation
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const status = otaSyncService.getSyncStatus()

    return NextResponse.json({ status }, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération du statut OTA:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du statut OTA' },
      { status: 500 }
    )
  }
}
