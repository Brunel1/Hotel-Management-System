import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'
import crypto from 'crypto'

/**
 * Route API pour la génération de clé digitale
 * POST /api/bookings/[id]/digital-key
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR' && userRole !== 'STAFF') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const bookingId = params.id

    // Récupérer la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que la réservation est check-in
    if (booking.status !== 'CHECKED_IN') {
      return NextResponse.json(
        { error: 'La clé digitale n\'est disponible qu\'après le check-in' },
        { status: 400 }
      )
    }

    // Générer une clé digitale unique
    const digitalKey = crypto.randomBytes(4).toString('hex').toUpperCase()
    const formattedKey = `${digitalKey.slice(0, 4)}-${digitalKey.slice(4, 8)}-${digitalKey.slice(8, 12)}`

    // Sauvegarder la clé (dans un champ personnalisé ou créer une table RFIDCard)
    // Pour l'instant, on va simuler en utilisant le champ notes ou créer une entrée RFIDCard
    const rfidCard = await prisma.rFIDCard.create({
      data: {
        userId: booking.userId,
        cardNumber: formattedKey,
        isActive: true,
        issuedAt: new Date(),
        expiresAt: booking.checkOut,
      },
    })

    return NextResponse.json(
      { message: 'Clé digitale générée avec succès', digitalKey: formattedKey },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la génération de la clé digitale:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la génération de la clé digitale' },
      { status: 500 }
    )
  }
}
