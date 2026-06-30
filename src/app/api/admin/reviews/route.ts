import { NextRequest, NextResponse } from 'next/server'
import { getAllReviews, updateReview, deleteReview, getRoomAverageRating } from '@/lib/reviews'

/**
 * Route API pour récupérer tous les avis (admin)
 * GET /api/admin/reviews?roomId=&userId=&isVisible=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')
    const userId = searchParams.get('userId')
    const isVisible = searchParams.get('isVisible')

    const filters: any = {}
    if (roomId) {
      filters.roomId = roomId
    }
    if (userId) {
      filters.userId = userId
    }
    if (isVisible !== null) {
      filters.isVisible = isVisible === 'true'
    }

    const reviews = await getAllReviews(filters)

    return NextResponse.json(reviews, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des avis' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour un avis (admin)
 * PATCH /api/admin/reviews
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

    const review = await updateReview(id, data)

    return NextResponse.json(review, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l&apos;avis:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l&apos;avis' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer un avis (admin)
 * DELETE /api/admin/reviews?id=
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

    await deleteReview(id)

    return NextResponse.json(
      { message: 'Avis supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de l&apos;avis:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l&apos;avis' },
      { status: 500 }
    )
  }
}
