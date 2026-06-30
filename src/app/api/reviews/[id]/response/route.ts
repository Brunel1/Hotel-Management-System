import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour répondre à un avis
 * POST /api/reviews/[id]/response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')
    const reviewId = params.id

    // Seuls les admins et editors peuvent répondre aux avis
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Texte de réponse requis' },
        { status: 400 }
      )
    }

    const { prisma } = await import('@/lib/prisma')

    // Récupérer l'utilisateur pour le nom du répondant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Créer ou mettre à jour la réponse
    const response = await prisma.reviewResponse.upsert({
      where: { reviewId },
      create: {
        reviewId,
        text,
        responderId: userId,
        responderName: user.profile?.firstName || user.email,
      },
      update: {
        text,
        responderId: userId,
        responderName: user.profile?.firstName || user.email,
      },
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la réponse à l\'avis:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réponse à l\'avis' },
      { status: 500 }
    )
  }
}
