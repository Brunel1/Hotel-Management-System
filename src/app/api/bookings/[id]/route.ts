import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'
import { z } from 'zod'
import { sendBookingAcceptedEmail, sendBookingCancelledEmail } from '@/lib/email'
import { applyCancellationPenalty } from '@/lib/cancellation'

// Schéma de validation pour la mise à jour de réservation
const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT']).optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  specialRequests: z.string().optional(),
})

/**
 * Route API pour récupérer une réservation par ID
 * GET /api/bookings/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Récupérer la réservation
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        room: {
          include: {
            amenities: {
              include: {
                amenity: true,
              },
            },
          },
        },
        invoice: true,
        payments: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    // Les visiteurs ne peuvent voir que leurs propres réservations
    if (userRole === 'VISITOR' && booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    return NextResponse.json(booking, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de la réservation' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour une réservation
 * PUT /api/bookings/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Parser le corps de la requête
    const body = await request.json()

    // Valider les données
    const validatedData = updateBookingSchema.parse(body)

    // Vérifier si la réservation existe
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    // Les visiteurs ne peuvent modifier que leurs propres réservations
    if (userRole === 'VISITOR' && existingBooking.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Seuls les éditeurs et admins peuvent modifier le statut
    if (validatedData.status && userRole === 'VISITOR') {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier le statut de la réservation' },
        { status: 403 }
      )
    }

    // Mettre à jour la réservation
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.adults && { adults: validatedData.adults }),
        ...(validatedData.children !== undefined && { children: validatedData.children }),
        ...(validatedData.specialRequests !== undefined && { specialRequests: validatedData.specialRequests }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        room: true,
        invoice: true,
        payments: true,
      },
    })

    // Envoyer un email selon le nouveau statut
    if (validatedData.status && booking.user.profile) {
      try {
        if (validatedData.status === 'CONFIRMED') {
          await sendBookingAcceptedEmail(
            booking.user.email,
            booking.user.profile.firstName,
            booking.user.profile.lastName,
            booking.room.number,
            booking.room.type,
            booking.checkIn.toISOString(),
            booking.checkOut.toISOString(),
            Number(booking.totalPrice)
          )
        } else if (validatedData.status === 'CANCELLED') {
          // Appliquer la pénalité d'annulation
          const penaltyInfo = await applyCancellationPenalty(booking.id)
          
          await sendBookingCancelledEmail(
            booking.user.email,
            booking.user.profile.firstName,
            booking.user.profile.lastName,
            booking.room.number,
            booking.room.type,
            booking.checkIn.toISOString(),
            booking.checkOut.toISOString(),
            penaltyInfo.penaltyAmount
          )
        }
      } catch (emailError) {
        console.error('Erreur lors de l&apos;envoi de l&apos;email:', emailError)
        // Ne pas bloquer la mise à jour si l'email échoue
      }
    }

    return NextResponse.json(
      { message: 'Réservation mise à jour avec succès', booking },
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
    console.error('Erreur lors de la mise à jour de la réservation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la réservation' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour annuler une réservation
 * DELETE /api/bookings/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier si la réservation existe
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    // Les visiteurs ne peuvent annuler que leurs propres réservations
    if (userRole === 'VISITOR' && existingBooking.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier si la réservation peut être annulée
    if (['CHECKED_IN', 'COMPLETED', 'CHECKED_OUT'].includes(existingBooking.status)) {
      return NextResponse.json(
        { error: 'Cette réservation ne peut plus être annulée' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut à CANCELLED
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json(
      { message: 'Réservation annulée avec succès', booking },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'annulation de la réservation' },
      { status: 500 }
    )
  }
}
