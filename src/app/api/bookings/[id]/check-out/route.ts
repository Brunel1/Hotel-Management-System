import { NextRequest, NextResponse } from 'next/server'
import { performCheckOut } from '@/lib/checkin-checkout'

/**
 * Route API pour effectuer le check-out d'une réservation
 * POST /api/bookings/[id]/check-out
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    const booking = await performCheckOut(bookingId)

    return NextResponse.json(
      { message: 'Check-out effectué avec succès', booking },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors du check-out:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue lors du check-out' },
      { status: 500 }
    )
  }
}
