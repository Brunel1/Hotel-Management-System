import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const { amount, bookingId } = await request.json()

    if (!amount || !bookingId) {
      return NextResponse.json(
        { error: 'Montant et bookingId requis' },
        { status: 400 }
      )
    }

    // Créer un PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        bookingId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Erreur lors de la création du PaymentIntent:', error)
    return NextResponse.json(
      { error: 'Impossible de créer le paiement' },
      { status: 500 }
    )
  }
}
