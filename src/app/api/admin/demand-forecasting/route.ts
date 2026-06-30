import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const days = parseInt(period)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    // Récupérer les réservations pour la période
    const bookings = await prisma.booking.findMany({
      where: {
        checkIn: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      },
      include: {
        room: true,
      },
    })

    // Calculer l'occupation prévue
    const totalRooms = await prisma.room.count()
    const occupiedRooms = bookings.length
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    // Calculer les revenus estimés
    const estimatedRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)

    // Facteurs influençant la demande
    const factors = [
      { name: 'Saison', impact: 'high', description: 'Haute saison touristique' },
      { name: 'Événements locaux', impact: 'medium', description: 'Conférences prévues' },
      { name: 'Concurrence', impact: 'low', description: 'Prix compétitifs' },
    ]

    return NextResponse.json({
      period: days,
      occupancyRate,
      estimatedRevenue,
      factors,
      bookings: bookings.length,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des prévisions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
