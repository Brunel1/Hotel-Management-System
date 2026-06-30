import { NextRequest, NextResponse } from 'next/server'
import { loyaltyService } from '@/lib/loyalty-service'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour les transactions de fidélité
 * GET /api/loyalty/transactions - Obtenir l'historique des transactions
 * POST /api/loyalty/transactions - Créer une transaction
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

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

    const transactions = await loyaltyService.getUserTransactions(
      targetUserId || userId,
      limit
    )

    return NextResponse.json(transactions, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Seuls les admins et editors peuvent créer des transactions manuelles
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { targetUserId, points, type, reason } = body

    if (!targetUserId || !points || !type || !reason) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    if (type === 'earned') {
      await loyaltyService.addPoints(targetUserId, points, reason)
    } else if (type === 'redeemed') {
      const success = await loyaltyService.redeemPoints(targetUserId, Math.abs(points), reason)
      if (!success) {
        return NextResponse.json(
          { error: 'Points insuffisants' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Type de transaction invalide' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Transaction créée avec succès' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la transaction' },
      { status: 500 }
    )
  }
}
