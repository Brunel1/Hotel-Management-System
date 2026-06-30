import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Route API pour récupérer les statistiques et rapports pour l'administrateur
 * GET /api/admin/reports
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month' // 'day', 'week', 'month', 'year'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Déterminer la plage de dates selon la période
    let dateFilter: { gte?: Date; lte?: Date } = {}
    const now = new Date()

    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else {
      switch (period) {
        case 'day':
          dateFilter = {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lte: new Date(now.setHours(23, 59, 59, 999)),
          }
          break
        case 'week':
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          dateFilter = {
            gte: weekAgo,
            lte: now,
          }
          break
        case 'month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          dateFilter = {
            gte: monthAgo,
            lte: now,
          }
          break
        case 'year':
          const yearAgo = new Date(now)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          dateFilter = {
            gte: yearAgo,
            lte: now,
          }
          break
      }
    }

    // Statistiques générales
    const totalRooms = await prisma.room.count({ where: { isActive: true } })
    const totalUsers = await prisma.user.count()
    const totalBookings = await prisma.booking.count({
      where: {
        checkIn: dateFilter,
      },
    })

    // Réservations par statut
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        checkIn: dateFilter,
      },
      _count: true,
    })

    // Revenus totaux
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        checkIn: dateFilter,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'] },
      },
      select: { totalPrice: true },
    })

    const totalRevenue = confirmedBookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0
    )

    // Taux d'occupation
    const totalCapacity = totalRooms * 30 // Approximation: 30 jours dans la période
    const occupancyRate = totalCapacity > 0 
      ? (totalBookings / totalCapacity) * 100 
      : 0

    // RevPAR (Revenue Per Available Room)
    const revPAR = totalRooms > 0 ? totalRevenue / totalRooms : 0

    // Réservations par chambre
    const bookingsByRoom = await prisma.booking.groupBy({
      by: ['roomId'],
      where: {
        checkIn: dateFilter,
      },
      _count: true,
    })

    const roomStats = await Promise.all(
      bookingsByRoom.map(async (stat) => {
        const room = await prisma.room.findUnique({
          where: { id: stat.roomId },
          select: { number: true, type: true },
        })
        return {
          roomNumber: room?.number || 'Inconnu',
          roomType: room?.type || 'Inconnu',
          bookingCount: stat._count || 0,
        }
      })
    )

    // Réservations par mois (pour les graphiques)
    const bookingsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "checkIn") as month,
        COUNT(*) as count,
        SUM("totalPrice") as revenue
      FROM "Booking"
      WHERE "checkIn" >= ${dateFilter.gte} AND "checkIn" <= ${dateFilter.lte}
      GROUP BY DATE_TRUNC('month', "checkIn")
      ORDER BY month ASC
    `

    // Chambres les plus réservées
    const topRooms = await prisma.booking.groupBy({
      by: ['roomId'],
      where: {
        checkIn: dateFilter,
      },
      _count: true,
      orderBy: { _count: { roomId: 'desc' } },
      take: 5,
    })

    const topRoomDetails = await Promise.all(
      topRooms.map(async (stat) => {
        const room = await prisma.room.findUnique({
          where: { id: stat.roomId },
          select: { number: true, type: true, pricePerNight: true },
        })
        return {
          roomNumber: room?.number || 'Inconnu',
          roomType: room?.type || 'Inconnu',
          pricePerNight: room?.pricePerNight || 0,
          bookingCount: stat._count,
        }
      })
    )

    return NextResponse.json({
      period,
      dateRange: {
        start: dateFilter.gte,
        end: dateFilter.lte,
      },
      overview: {
        totalRooms,
        totalUsers,
        totalBookings,
        totalRevenue,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        revPAR: Math.round(revPAR * 100) / 100,
      },
      bookingsByStatus: bookingsByStatus.reduce((acc, stat) => {
        acc[stat.status] = stat._count
        return acc
      }, {} as Record<string, number>),
      roomStats,
      bookingsByMonth,
      topRooms: topRoomDetails,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des rapports' },
      { status: 500 }
    )
  }
}
