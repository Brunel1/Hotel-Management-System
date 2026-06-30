import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour le check-out d'une réservation
 * POST /api/bookings/[id]/checkout
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR' && userRole !== 'STAFF') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const bookingId = params.id

    // Récupérer la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que la réservation peut être check-out
    if (booking.status !== 'CHECKED_IN') {
      return NextResponse.json(
        { error: 'Cette réservation ne peut pas être check-out' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CHECKED_OUT' },
    })

    return NextResponse.json(
      { message: 'Check-out effectué avec succès', booking: updatedBooking },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors du check-out:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du check-out' },
      { status: 500 }
    )
  }
}
