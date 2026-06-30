import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour marquer un avis comme utile
 * POST /api/reviews/[id]/helpful
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(request)
    const reviewId = params.id

    const { prisma } = await import('@/lib/prisma')

    // Vérifier si l'utilisateur a déjà marqué cet avis comme utile
    const existingMark = await prisma.reviewHelpful.findFirst({
      where: {
        reviewId,
        userId,
      },
    })

    if (existingMark) {
      // Retirer le marquage
      await prisma.reviewHelpful.delete({
        where: { id: existingMark.id },
      })
    } else {
      // Ajouter le marquage
      await prisma.reviewHelpful.create({
        data: {
          reviewId,
          userId,
        },
      })
    }

    // Mettre à jour le compteur de helpful
    const helpfulCount = await prisma.reviewHelpful.count({
      where: { reviewId },
    })

    return NextResponse.json({ helpfulCount }, { status: 200 })
  } catch (error) {
    console.error('Erreur lors du marquage de l\'avis comme utile:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du marquage de l\'avis comme utile' },
      { status: 500 }
    )
  }
}
