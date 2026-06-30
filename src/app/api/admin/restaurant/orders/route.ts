import { NextRequest, NextResponse } from 'next/server'
import { createRestaurantOrder, getRestaurantOrders, updateRestaurantOrder } from '@/lib/restaurant'
import { z } from 'zod'

// Schéma de validation pour la création de commande
const orderSchema = z.object({
  bookingId: z.string().optional(),
  userId: z.string().optional(),
  type: z.string(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  specialRequests: z.string().optional(),
})

/**
 * Route API pour créer une commande de restaurant (admin)
 * POST /api/admin/restaurant/orders
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = orderSchema.parse(body)

    // Créer la commande
    const order = await createRestaurantOrder(validatedData)

    return NextResponse.json(
      { message: 'Commande créée avec succès', order },
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
    console.error('Erreur lors de la création de la commande:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la commande' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les commandes de restaurant (admin)
 * GET /api/admin/restaurant/orders?bookingId=&userId=&status=&type=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const filters: any = {}
    if (bookingId) filters.bookingId = bookingId
    if (userId) filters.userId = userId
    if (status) filters.status = status
    if (type) filters.type = type

    const orders = await getRestaurantOrders(filters)

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour une commande de restaurant (admin)
 * PATCH /api/admin/restaurant/orders
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (data.status) updateData.status = data.status
    if (data.specialRequests !== undefined) updateData.specialRequests = data.specialRequests

    const order = await updateRestaurantOrder(id, updateData)

    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la commande' },
      { status: 500 }
    )
  }
}
