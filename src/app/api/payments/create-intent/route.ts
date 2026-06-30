import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment-service'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour créer un Payment Intent
 * POST /api/payments/create-intent
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()
    const { bookingId, amount, currency } = body

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Booking ID et montant requis' },
        { status: 400 }
      )
    }

    const result = await paymentService.createPaymentIntent(
      bookingId,
      amount,
      currency || 'MGA',
      userId
    )

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la création du Payment Intent:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du Payment Intent' },
      { status: 500 }
    )
  }
}
