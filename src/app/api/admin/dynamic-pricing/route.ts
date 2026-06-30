import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllRealTimePrices, calculateRealTimePrice, getPriceTrends } from '@/lib/dynamic-pricing'

/**
 * Route API pour récupérer tous les prix en temps réel
 * GET /api/admin/dynamic-pricing
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')
    const trends = searchParams.get('trends') === 'true'

    if (roomId) {
      if (trends) {
        // Récupérer les tendances de prix pour une chambre spécifique
        const priceTrends = await getPriceTrends(roomId)
        return NextResponse.json(priceTrends, { status: 200 })
      } else {
        // Récupérer le prix en temps réel pour une chambre spécifique
        const room = await prisma.room.findUnique({
          where: { id: roomId },
        })

        if (!room) {
          return NextResponse.json(
            { error: 'Chambre non trouvée' },
            { status: 404 }
          )
        }

        const realTimePrice = await calculateRealTimePrice(roomId, Number(room.pricePerNight))
        return NextResponse.json(
          { roomId, basePrice: Number(room.pricePerNight), realTimePrice },
          { status: 200 }
        )
      }
    } else {
      // Récupérer tous les prix en temps réel
      const prices = await getAllRealTimePrices()
      return NextResponse.json(prices, { status: 200 })
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des prix en temps réel:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des prix en temps réel' },
      { status: 500 }
    )
  }
}
