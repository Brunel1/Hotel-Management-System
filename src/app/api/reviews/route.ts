import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { createReview, getUserReviews, getReviewsForRoom } from '@/lib/reviews'
import { z } from 'zod'

// Schéma de validation pour la création d'un avis
const reviewSchema = z.object({
  roomId: z.string().optional(),
  rating: z.number().min(1).max(5),
  title: z.string(),
  comment: z.string(),
  travelType: z.enum(['family', 'business', 'couple', 'solo', 'friends']),
  roomType: z.string(),
  images: z.array(z.string()).optional(),
})

/**
 * Route API pour créer un avis
 * POST /api/reviews
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    // Valider les données
    const validatedData = reviewSchema.parse(body)

    // Vérifier que l'utilisateur n'a pas déjà noté cette chambre
    const { prisma } = await import('@/lib/prisma')
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        roomId: validatedData.roomId,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà noté cette chambre' },
        { status: 400 }
      )
    }

    // Créer l'avis
    const review = await createReview({
      userId,
      ...validatedData,
    })

    return NextResponse.json(
      { message: 'Avis créé avec succès', review },
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
    console.error('Erreur lors de la création de l&apos;avis:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l&apos;avis' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les avis de l'utilisateur
 * GET /api/reviews
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')

    if (roomId) {
      const reviews = await getReviewsForRoom(roomId)
      return NextResponse.json(reviews, { status: 200 })
    }

    const userId = getUserId(request)
    const reviews = await getUserReviews(userId)

    return NextResponse.json(reviews, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des avis' },
      { status: 500 }
    )
  }
}
