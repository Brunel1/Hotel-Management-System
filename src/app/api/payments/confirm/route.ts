import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment-service'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour confirmer un paiement
 * POST /api/payments/confirm
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID requis' },
        { status: 400 }
      )
    }

    const paymentIntent = await paymentService.confirmPayment(paymentIntentId)

    // Vérifier que le paiement appartient à l'utilisateur
    if (paymentIntent.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    return NextResponse.json(paymentIntent, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la confirmation du paiement' },
      { status: 500 }
    )
  }
}
