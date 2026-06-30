import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'
import { z } from 'zod'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { calculateFinalPrice } from '@/lib/pricing'
import { addLoyaltyPoints } from '@/lib/loyalty'
import { applyPromoCode } from '@/lib/promo-codes'
import { addSupplementsToBooking, calculateSupplementsTotal } from '@/lib/supplements'

// Schéma de validation pour la création de réservation
const createBookingSchema = z.object({
  roomId: z.string().min(1, 'L\'ID de la chambre est requis'),
  checkIn: z.string().datetime('Date d\'arrivée invalide'),
  checkOut: z.string().datetime('Date de départ invalide'),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  specialRequests: z.string().optional(),
  promoCode: z.string().optional(),
  supplements: z.array(z.object({
    supplementId: z.string(),
    quantity: z.number().int().min(1),
  })).optional(),
})

/**
 * Route API pour récupérer toutes les réservations
 * GET /api/bookings
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')

    // Construire le filtre
    const where: Record<string, unknown> = {}

    // Les visiteurs ne voient que leurs propres réservations
    if (userRole === 'VISITOR' && userId) {
      where.userId = userId
    }

    // Les éditeurs et admins peuvent filtrer par statut
    if (status) {
      where.status = status
    }

    if (roomId) {
      where.roomId = roomId
    }

    // Récupérer les réservations
    const bookings = await prisma.booking.findMany({
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour créer une nouvelle réservation
 * POST /api/bookings
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Parser le corps de la requête
    const body = await request.json()

    // Valider les données
    const validatedData = createBookingSchema.parse(body)

    // Convertir les dates
    const checkInDate = new Date(validatedData.checkIn)
    const checkOutDate = new Date(validatedData.checkOut)

    // Vérifier que la date de départ est après la date d'arrivée
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'La date de départ doit être après la date d\'arrivée' },
        { status: 400 }
      )
    }

    // Vérifier que la chambre existe
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que la chambre est active
    if (!room.isActive) {
      return NextResponse.json(
        { error: 'Cette chambre n\'est pas disponible' },
        { status: 400 }
      )
    }

    // Vérifier la capacité
    if (validatedData.adults + validatedData.children > room.capacity) {
      return NextResponse.json(
        { error: 'La capacité de la chambre est dépassée' },
        { status: 400 }
      )
    }

    // Vérifier les disponibilités pour les dates demandées
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId: validatedData.roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        OR: [
          {
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'La chambre n\'est pas disponible pour ces dates' },
        { status: 400 }
      )
    }

    // Calculer le prix total avec tarification dynamique
    let totalPrice = await calculateFinalPrice(
      Number(room.pricePerNight),
      validatedData.roomId,
      room.type,
      checkInDate,
      checkOutDate
    )

    // Appliquer le code de réduction si fourni
    let discountAmount = 0
    if (validatedData.promoCode) {
      const promoResult = await applyPromoCode(validatedData.promoCode, totalPrice)
      if (promoResult.success) {
        totalPrice = promoResult.finalAmount
        discountAmount = promoResult.discount
      }
    }

    // Calculer le prix des suppléments
    let supplementsTotal = 0
    if (validatedData.supplements && validatedData.supplements.length > 0) {
      supplementsTotal = await calculateSupplementsTotal(validatedData.supplements)
      totalPrice += supplementsTotal
    }

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId: validatedData.roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: validatedData.adults,
        children: validatedData.children,
        totalPrice,
        status: 'PENDING',
        specialRequests: validatedData.specialRequests,
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    })

    // Ajouter les suppléments à la réservation
    if (validatedData.supplements && validatedData.supplements.length > 0) {
      await addSupplementsToBooking(booking.id, validatedData.supplements)
    }

    // Envoyer un email de confirmation de réservation
    try {
      if (booking.user.profile) {
        await sendBookingConfirmationEmail(
          booking.user.email,
          booking.user.profile.firstName,
          booking.user.profile.lastName,
          booking.room.number,
          booking.room.type,
          booking.checkIn.toISOString(),
          booking.checkOut.toISOString(),
          Number(booking.totalPrice)
        )
      }
    } catch (emailError) {
      console.error('Erreur lors de l&apos;envoi de l&apos;email de confirmation:', emailError)
      // Ne pas bloquer la création de réservation si l'email échoue
    }

    // Ajouter des points de fidélité pour la réservation
    try {
      await addLoyaltyPoints(userId, Number(booking.totalPrice))
    } catch (loyaltyError) {
      console.error('Erreur lors de l&apos;ajout des points de fidélité:', loyaltyError)
      // Ne pas bloquer la création de réservation si l'ajout de points échoue
    }

    return NextResponse.json(
      { message: 'Réservation créée avec succès', booking },
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
    console.error('Erreur lors de la création de la réservation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la réservation' },
      { status: 500 }
    )
  }
}
