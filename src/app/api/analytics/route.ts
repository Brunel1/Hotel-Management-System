import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour récupérer les analytics
 * GET /api/analytics?timeRange=7d|30d|90d|1y
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions (seuls les admins peuvent voir les analytics)
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculer la date de début selon la plage de temps
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Récupérer les réservations dans la plage de temps
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        room: true,
      },
    })

    // Calculer les KPIs
    const totalBookings = bookings.length
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0)
    
    // Calculer le taux d'occupation
    const totalRooms = await prisma.room.count({ where: { isActive: true } })
    const occupiedRooms = bookings.filter(b => 
      b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
    ).length
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    // Calculer la note moyenne
    const reviews = await prisma.review.findMany({
      where: {
        createdAt: { gte: startDate },
      },
    })
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Statut des réservations
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length

    // Revenus par mois
    const revenueByMonth = bookings.reduce((acc, booking) => {
      const month = new Date(booking.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      const existing = acc.find(item => item.month === month)
      if (existing) {
        existing.revenue += Number(booking.totalPrice)
      } else {
        acc.push({ month, revenue: Number(booking.totalPrice) })
      }
      return acc
    }, [] as { month: string; revenue: number }[])

    // Réservations par type de chambre
    const bookingsByRoomType = bookings.reduce((acc, booking) => {
      const type = booking.room.type
      const existing = acc.find(item => item.type === type)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ type, count: 1 })
      }
      return acc
    }, [] as { type: string; count: number }[])

    const analytics = {
      totalBookings,
      totalRevenue,
      occupancyRate,
      averageRating,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      revenueByMonth,
      bookingsByRoomType,
    }

    return NextResponse.json(analytics, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des analytics' },
      { status: 500 }
    )
  }
}
