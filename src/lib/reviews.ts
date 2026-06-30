import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des avis et évaluations
 */

/**
 * Créer un avis
 */
export async function createReview(data: {
  userId: string
  roomId: string
  rating: number
  comment: string
  photos?: string[]
}) {
  const review = await prisma.review.create({
    data: {
      userId: data.userId,
      roomId: data.roomId,
      rating: data.rating,
      comment: data.comment,
      photos: data.photos || [],
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
    },
  })

  return review
}

/**
 * Récupérer tous les avis pour une chambre
 */
export async function getReviewsForRoom(roomId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      roomId,
      isVisible: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return reviews
}

/**
 * Récupérer tous les avis d'un utilisateur
 */
export async function getUserReviews(userId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      userId,
    },
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return reviews
}

/**
 * Mettre à jour un avis
 */
export async function updateReview(reviewId: string, data: {
  rating?: number
  comment?: string
  photos?: string[]
  isVisible?: boolean
}) {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
    },
  })

  return review
}

/**
 * Supprimer un avis
 */
export async function deleteReview(reviewId: string) {
  await prisma.review.delete({
    where: { id: reviewId },
  })
}

/**
 * Calculer la note moyenne d'une chambre
 */
export async function getRoomAverageRating(roomId: string): Promise<number> {
  const reviews = await prisma.review.findMany({
    where: {
      roomId,
      isVisible: true,
    },
    select: { rating: true },
  })

  if (reviews.length === 0) {
    return 0
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  return totalRating / reviews.length
}

/**
 * Récupérer tous les avis (admin)
 */
export async function getAllReviews(filters?: {
  roomId?: string
  userId?: string
  isVisible?: boolean
}) {
  const where: any = {}

  if (filters?.roomId) {
    where.roomId = filters.roomId
  }
  if (filters?.userId) {
    where.userId = filters.userId
  }
  if (filters?.isVisible !== undefined) {
    where.isVisible = filters.isVisible
  }

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return reviews
}
