import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Route API pour récupérer les statistiques du tableau de bord
 * GET /api/admin/stats
 */
export async function GET() {
  try {
    // Récupérer les statistiques de base
    const totalRooms = await prisma.room.count({ where: { isActive: true } })
    const totalBookings = await prisma.booking.count()
    const totalUsers = await prisma.user.count()
    
    // Calculer les revenus totaux
    const bookings = await prisma.booking.findMany({
      where: { status: { in: ['CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT'] } },
      select: { totalPrice: true },
    })
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0)

    // Réservations en attente
    const pendingBookings = await prisma.booking.count({
      where: { status: 'PENDING' },
    })

    // Réservations actives
    const activeBookings = await prisma.booking.count({
      where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
    })

    // Revenus mensuels (6 derniers mois)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthBookings = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT'] },
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { totalPrice: true },
      })
      
      const revenue = monthBookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0)
      monthlyRevenue.push({ month: month.charAt(0).toUpperCase() + month.slice(1), revenue })
    }

    // Réservations par statut
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: true,
    })
    const statusLabels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
      COMPLETED: 'Terminée',
      CHECKED_IN: 'Arrivée',
      CHECKED_OUT: 'Départ',
    }
    const bookingsByStatusFormatted = bookingsByStatus.map((item) => ({
      status: statusLabels[item.status] || item.status,
      count: item._count,
    }))

    // Taux d'occupation (30 derniers jours)
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const totalNights = totalRooms * 30
    const occupiedNights = await prisma.booking.count({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'] },
        OR: [
          {
            checkIn: { lte: now },
            checkOut: { gte: thirtyDaysAgo },
          },
        ],
      },
    })
    const occupancyRate = totalNights > 0 ? Math.round((occupiedNights / totalNights) * 100) : 0

    // Chambres les plus réservées
    const topRooms = await prisma.booking.groupBy({
      by: ['roomId'],
      _count: true,
      orderBy: { _count: { roomId: 'desc' } },
      take: 5,
    })
    
    const topRoomsWithDetails = await Promise.all(
      topRooms.map(async (item) => {
        const room = await prisma.room.findUnique({
          where: { id: item.roomId },
        })
        return {
          roomNumber: room?.number || 'N/A',
          type: room?.type || 'N/A',
          bookingCount: item._count,
        }
      })
    )

    return NextResponse.json(
      {
        totalRooms,
        totalBookings,
        totalUsers,
        totalRevenue: Math.round(totalRevenue),
        pendingBookings,
        activeBookings,
        monthlyRevenue,
        bookingsByStatus: bookingsByStatusFormatted,
        occupancyRate,
        topRooms: topRoomsWithDetails,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
