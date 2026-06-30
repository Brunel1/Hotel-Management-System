import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour récupérer les données CRM d'un utilisateur
 * GET /api/crm/[userId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const currentUserId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole === 'VISITOR' && currentUserId !== userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer ou créer le record CRM
    let crmRecord = await prisma.cRMRecord.findUnique({
      where: { userId },
    })

    if (!crmRecord) {
      // Créer le record CRM s'il n'existe pas
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

      // Calculer les statistiques
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: { room: true },
      })

      const totalBookings = bookings.length
      const totalSpent = bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0)
      
      // Calculer la note moyenne
      const reviews = await prisma.review.findMany({
        where: { userId },
      })
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

      // Récupérer les points de fidélité
      const loyaltyPoints = await prisma.loyaltyPoint.findUnique({
        where: { userId },
      })

      // Dernière réservation
      const lastBooking = bookings.length > 0
        ? bookings.reduce((latest, b) => 
            new Date(b.createdAt) > new Date(latest.createdAt) ? b : latest
          )
        : null

      crmRecord = await prisma.cRMRecord.create({
        data: {
          userId,
          email: user.email,
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          phone: user.profile?.phone || '',
          totalBookings,
          totalSpent,
          averageRating,
          loyaltyPoints: loyaltyPoints?.points || 0,
          lastBooking: lastBooking?.createdAt || null,
        },
      })
    }

    return NextResponse.json(crmRecord, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des données CRM:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des données CRM' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour les données CRM
 * PUT /api/crm/[userId]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const currentUserId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole === 'VISITOR' && currentUserId !== userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Mettre à jour le record CRM
    const crmRecord = await prisma.cRMRecord.update({
      where: { userId },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.phone && { phone: body.phone }),
      },
    })

    return NextResponse.json(
      { message: 'Données CRM mises à jour avec succès', crmRecord },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données CRM:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour des données CRM' },
      { status: 500 }
    )
  }
}
