import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditorOrAdmin } from '@/lib/permissions'
import { z } from 'zod'

// Schéma de validation pour la mise à jour de chambre
const updateRoomSchema = z.object({
  number: z.string().min(1).optional(),
  type: z.enum(['STANDARD', 'SUPERIOR', 'SUITE', 'DELUXE', 'FAMILY']).optional(),
  capacity: z.number().int().min(1).optional(),
  pricePerNight: z.number().positive().optional(),
  floor: z.number().int().optional(),
  description: z.string().min(10).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  amenities: z.array(z.string()).optional(),
})

/**
 * Route API pour récupérer une chambre par ID
 * GET /api/rooms/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Récupérer la chambre avec les équipements et les avis
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
        reviews: {
          where: { isVisible: true },
          include: {
            user: {
              select: {
                profile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            checkOut: { gte: new Date() },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    // Calculer la note moyenne
    const averageRating =
      room.reviews.length > 0
        ? room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length
        : 0

    // Formater les dates de réservation pour le calendrier
    const bookedDates = room.bookings.map((booking) => ({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    }))

    return NextResponse.json(
      {
        ...room,
        averageRating,
        reviewCount: room.reviews.length,
        bookedDates,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération de la chambre:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de la chambre' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour une chambre
 * PUT /api/rooms/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier les permissions
    const permissionError = requireEditorOrAdmin(request)
    if (permissionError) return permissionError

    const { id } = await params

    // Parser le corps de la requête
    const body = await request.json()

    // Valider les données
    const validatedData = updateRoomSchema.parse(body)

    // Vérifier si la chambre existe
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    })

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    // Si le numéro de chambre est modifié, vérifier s'il existe déjà
    if (validatedData.number && validatedData.number !== existingRoom.number) {
      const roomWithSameNumber = await prisma.room.findUnique({
        where: { number: validatedData.number },
      })

      if (roomWithSameNumber) {
        return NextResponse.json(
          { error: 'Ce numéro de chambre existe déjà' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour la chambre
    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(validatedData.number && { number: validatedData.number }),
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.capacity && { capacity: validatedData.capacity }),
        ...(validatedData.pricePerNight && { pricePerNight: validatedData.pricePerNight }),
        ...(validatedData.floor !== undefined && { floor: validatedData.floor }),
        ...(validatedData.description && { description: validatedData.description }),
        ...(validatedData.images && { images: validatedData.images }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    })

    // Mettre à jour les équipements si fournis
    if (validatedData.amenities) {
      // Supprimer les anciens équipements
      await prisma.roomAmenity.deleteMany({
        where: { roomId: id },
      })

      // Ajouter les nouveaux équipements
      await prisma.roomAmenity.createMany({
        data: validatedData.amenities.map((amenityId: string) => ({
          roomId: id,
          amenityId,
        })),
      })

      // Récupérer la chambre mise à jour avec les nouveaux équipements
      const updatedRoom = await prisma.room.findUnique({
        where: { id },
        include: {
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      })

      return NextResponse.json(
        { message: 'Chambre mise à jour avec succès', room: updatedRoom },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'Chambre mise à jour avec succès', room },
      { status: 200 }
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
    console.error('Erreur lors de la mise à jour de la chambre:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la chambre' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer une chambre
 * DELETE /api/rooms/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier les permissions (seul admin peut supprimer)
    const permissionError = requireEditorOrAdmin(request)
    if (permissionError) return permissionError

    const { id } = await params

    // Vérifier si la chambre existe
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          },
        },
      },
    })

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier si la chambre a des réservations actives
    if (existingRoom.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une chambre avec des réservations actives' },
        { status: 400 }
      )
    }

    // Supprimer la chambre
    await prisma.room.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Chambre supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de la chambre:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la chambre' },
      { status: 500 }
    )
  }
}
