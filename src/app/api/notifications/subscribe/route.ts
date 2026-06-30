import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { subscribeToPushNotifications, getUserPushSubscriptions, deletePushSubscription } from '@/lib/notifications'
import { z } from 'zod'

// Schéma de validation pour l'abonnement
const subscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

/**
 * Route API pour s'abonner aux notifications push
 * POST /api/notifications/subscribe
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    // Valider les données
    const validatedData = subscriptionSchema.parse(body)

    // Créer l'abonnement
    const subscription = await subscribeToPushNotifications({
      userId,
      endpoint: validatedData.endpoint,
      keys: validatedData.keys,
    })

    return NextResponse.json(
      { message: 'Abonnement créé avec succès', subscription },
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
    console.error('Erreur lors de la création de l&apos;abonnement:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l&apos;abonnement' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les abonnements de l'utilisateur
 * GET /api/notifications/subscribe
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const subscriptions = await getUserPushSubscriptions(userId)

    return NextResponse.json(subscriptions, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des abonnements' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer un abonnement
 * DELETE /api/notifications/subscribe?id=
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

    await deletePushSubscription(id)

    return NextResponse.json(
      { message: 'Abonnement supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de l&apos;abonnement:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l&apos;abonnement' },
      { status: 500 }
    )
  }
}
