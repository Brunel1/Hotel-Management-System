import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { getOrCreateLoyaltyPoints, useLoyaltyPoints, calculateTotalDiscount } from '@/lib/loyalty'

/**
 * Route API pour récupérer les points de fidélité de l'utilisateur
 * GET /api/loyalty
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    const loyaltyPoints = await getOrCreateLoyaltyPoints(userId)

    return NextResponse.json(loyaltyPoints, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des points de fidélité:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des points de fidélité' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour utiliser des points de fidélité
 * POST /api/loyalty/use
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { pointsToUse, amount } = body

    if (!pointsToUse || pointsToUse <= 0) {
      return NextResponse.json(
        { error: 'Nombre de points invalide' },
        { status: 400 }
      )
    }

    const updatedPoints = await useLoyaltyPoints(userId, pointsToUse)

    // Calculer la réduction totale
    const totalDiscount = await calculateTotalDiscount(userId, amount || 0)

    return NextResponse.json(
      { 
        message: 'Points utilisés avec succès', 
        loyaltyPoints: updatedPoints,
        discount: totalDiscount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de l&apos;utilisation des points de fidélité:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
