import { NextRequest, NextResponse } from 'next/server'
import { calculateDayUsePrice, isDayUseAvailable } from '@/lib/day-use'

/**
 * Route API pour calculer le prix day-use
 * GET /api/day-use/price?roomId=&checkIn=&checkOut=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')

    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'roomId, checkIn et checkOut requis' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Vérifier la disponibilité
    const available = await isDayUseAvailable(roomId, checkInDate, checkOutDate)

    if (!available) {
      return NextResponse.json(
        { error: 'Chambre non disponible pour cette période' },
        { status: 409 }
      )
    }

    // Calculer le prix
    const price = await calculateDayUsePrice(roomId, checkInDate, checkOutDate)

    return NextResponse.json({
      price,
      currency: 'EUR',
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
    })
  } catch (error) {
    console.error('Erreur lors du calcul du prix day-use:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue lors du calcul du prix day-use' },
      { status: 500 }
    )
  }
}
