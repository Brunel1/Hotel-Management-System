import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment-service'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour créer un remboursement
 * POST /api/payments/refund
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Seuls les admins et editors peuvent créer des remboursements
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { paymentIntentId, amount, reason } = body

    if (!paymentIntentId || !amount) {
      return NextResponse.json(
        { error: 'Payment Intent ID et montant requis' },
        { status: 400 }
      )
    }

    const refund = await paymentService.createRefund(
      paymentIntentId,
      amount,
      reason || 'requested_by_customer'
    )

    return NextResponse.json(refund, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la création du remboursement:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du remboursement' },
      { status: 500 }
    )
  }
}
