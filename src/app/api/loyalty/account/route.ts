import { NextRequest, NextResponse } from 'next/server'
import { loyaltyService } from '@/lib/loyalty-service'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour le compte de fidélité
 * GET /api/loyalty/account - Obtenir le compte de fidélité
 * POST /api/loyalty/account - Créer un compte de fidélité
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    // Vérifier les permissions si on demande un autre utilisateur
    if (targetUserId && targetUserId !== userId) {
      const userRole = request.headers.get('x-user-role')
      if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        )
      }
    }

    const account = await loyaltyService.getLoyaltyAccount(targetUserId || userId)
    const level = await loyaltyService.getUserLevel(targetUserId || userId)

    if (!account) {
      return NextResponse.json(
        { error: 'Compte de fidélité non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { account, level },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération du compte de fidélité:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du compte de fidélité' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    const account = {
      userId,
      points: 0,
      level: 'bronze',
      totalEarned: 0,
      totalRedeemed: 0,
      ...body,
    }

    // En production, sauvegarder dans la base de données
    await loyaltyService.createLoyaltyAccount(userId)

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du compte de fidélité:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte de fidélité' },
      { status: 500 }
    )
  }
}
