import { NextRequest, NextResponse } from 'next/server'
import { createTransaction, getTransactions, refundTransaction, getPOSStatistics } from '@/lib/pos'
import { z } from 'zod'

// Schéma de validation pour la création de transaction
const transactionSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  paymentMethod: z.string(),
  bookingId: z.string().optional(),
  userId: z.string().optional(),
})

/**
 * Route API pour créer une transaction de caisse (admin)
 * POST /api/admin/pos/transactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = transactionSchema.parse(body)

    // Créer la transaction
    const transaction = await createTransaction(validatedData)

    return NextResponse.json(
      { message: 'Transaction créée avec succès', transaction },
      { status: 201 }
    )
  } catch (error) {
    // Gérer les erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    // Gérer les autres erreurs
    console.error('Erreur lors de la création de la transaction:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la transaction' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les transactions (admin)
 * GET /api/admin/pos/transactions?startDate=&endDate=&paymentMethod=&bookingId=&stats=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentMethod = searchParams.get('paymentMethod')
    const bookingId = searchParams.get('bookingId')
    const stats = searchParams.get('stats') === 'true'

    if (stats && startDate && endDate) {
      const statistics = await getPOSStatistics(new Date(startDate), new Date(endDate))
      return NextResponse.json(statistics, { status: 200 })
    }

    const filters: any = {}
    if (startDate && endDate) {
      filters.startDate = new Date(startDate)
      filters.endDate = new Date(endDate)
    }
    if (paymentMethod) filters.paymentMethod = paymentMethod
    if (bookingId) filters.bookingId = bookingId

    const transactions = await getTransactions(filters)

    return NextResponse.json(transactions, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des transactions' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour rembourser une transaction (admin)
 * DELETE /api/admin/pos/transactions?id=
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const transaction = await refundTransaction(id)

    return NextResponse.json(transaction, { status: 200 })
  } catch (error) {
    console.error('Erreur lors du remboursement de la transaction:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue lors du remboursement de la transaction' },
      { status: 500 }
    )
  }
}
