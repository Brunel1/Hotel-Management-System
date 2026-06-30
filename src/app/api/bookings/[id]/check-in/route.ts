import { NextRequest, NextResponse } from 'next/server'
import { performCheckIn } from '@/lib/checkin-checkout'

/**
 * Route API pour effectuer le check-in d'une réservation
 * POST /api/bookings/[id]/check-in
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    const booking = await performCheckIn(bookingId)

    return NextResponse.json(
      { message: 'Check-in effectué avec succès', booking },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors du check-in:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue lors du check-in' },
      { status: 500 }
    )
  }
}
