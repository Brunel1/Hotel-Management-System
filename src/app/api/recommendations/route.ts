import { NextRequest, NextResponse } from 'next/server'
import { aiRecommendationService } from '@/lib/ai-recommendations'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour les recommandations IA
 * GET /api/recommendations - Obtenir des recommandations
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const bookingId = searchParams.get('bookingId')
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date')

    let result

    switch (type) {
      case 'rooms':
        if (!userId || !checkIn || !checkOut) {
          return NextResponse.json(
            { error: 'Paramètres manquants' },
            { status: 400 }
          )
        }
        result = await aiRecommendationService.getRoomRecommendations(
          userId,
          new Date(checkIn),
          new Date(checkOut)
        )
        break

      case 'upsell':
        if (!bookingId) {
          return NextResponse.json(
            { error: 'Booking ID requis' },
            { status: 400 }
          )
        }
        result = await aiRecommendationService.getUpsellSuggestions(bookingId)
        break

      case 'demand':
        if (!date) {
          return NextResponse.json(
            { error: 'Date requise' },
            { status: 400 }
          )
        }
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 30) // Prédiction sur 30 jours
        result = await aiRecommendationService.predictDemand(startDate, endDate)
        break

      case 'pricing':
        if (!roomId || !date) {
          return NextResponse.json(
            { error: 'Room ID et date requis' },
            { status: 400 }
          )
        }
        result = await aiRecommendationService.calculateDynamicPricing(
          roomId,
          new Date(date)
        )
        break

      default:
        return NextResponse.json(
          { error: 'Type de recommandation invalide' },
          { status: 400 }
        )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la génération des recommandations' },
      { status: 500 }
    )
  }
}
