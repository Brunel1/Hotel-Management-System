import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditorOrAdmin } from '@/lib/permissions'
import { z } from 'zod'

// Schéma de validation pour la création de chambre
const createRoomSchema = z.object({
  number: z.string().min(1, 'Le numéro de chambre est requis'),
  type: z.enum(['STANDARD', 'SUPERIOR', 'SUITE', 'DELUXE', 'FAMILY']),
  capacity: z.number().int().min(1, 'La capacité doit être d\'au moins 1'),
  pricePerNight: z.number().positive('Le prix doit être positif'),
  floor: z.number().int().optional(),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
})

/**
 * Route API pour récupérer toutes les chambres
 * GET /api/rooms
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const capacity = searchParams.get('capacity')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const isActive = searchParams.get('isActive')

    // Construire le filtre
    const where: Record<string, unknown> = {}

    if (type) {
      where.type = type
    }

    if (capacity) {
      where.capacity = { gte: parseInt(capacity) }
    }

    if (minPrice || maxPrice) {
      where.pricePerNight = {}
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice)
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice)
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // Récupérer les chambres avec les équipements
    const rooms = await prisma.room.findMany({
      where,
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
        reviews: {
          where: { isVisible: true },
          select: {
            rating: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    })

    // Calculer la note moyenne pour chaque chambre
    const roomsWithAverageRating = rooms.map((room) => {
      const averageRating =
        room.reviews.length > 0
          ? room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length
          : 0

      return {
        ...room,
        averageRating,
        reviewCount: room.reviews.length,
      }
    })

    return NextResponse.json(roomsWithAverageRating, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des chambres:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des chambres' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour créer une nouvelle chambre
 * POST /api/rooms
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier les permissions
    const permissionError = requireEditorOrAdmin(request)
    if (permissionError) return permissionError

    // Parser le corps de la requête
    const body = await request.json()

    // Valider les données
    const validatedData = createRoomSchema.parse(body)

    // Vérifier si le numéro de chambre existe déjà
    const existingRoom = await prisma.room.findUnique({
      where: { number: validatedData.number },
    })

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Ce numéro de chambre existe déjà' },
        { status: 400 }
      )
    }

    // Créer la chambre
    const room = await prisma.room.create({
      data: {
        number: validatedData.number,
        type: validatedData.type,
        capacity: validatedData.capacity,
        pricePerNight: validatedData.pricePerNight,
        floor: validatedData.floor,
        description: validatedData.description,
        images: validatedData.images || [],
        amenities: validatedData.amenities
          ? {
              create: validatedData.amenities.map((amenityId: string) => ({
                amenityId,
              })),
            }
          : undefined,
      },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    })

    return NextResponse.json(
      { message: 'Chambre créée avec succès', room },
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
    console.error('Erreur lors de la création de la chambre:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la chambre' },
      { status: 500 }
    )
  }
}
