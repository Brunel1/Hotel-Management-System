import { prisma } from '@/lib/prisma'

/**
 * Service de gestion de l'historique des réservations et statistiques
 */

/**
 * Récupérer l'historique des réservations d'un utilisateur
 */
export async function getUserBookingHistory(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
          images: true,
        },
      },
      bookingSupplements: {
        include: {
          supplement: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return bookings
}

/**
 * Obtenir les statistiques d'un utilisateur
 */
export async function getUserStatistics(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
  })

  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b) => b.status === 'CHECKED_OUT').length
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length
  const totalSpent = bookings
    .filter((b) => b.status === 'CHECKED_OUT')
    .reduce((sum, b) => sum + Number(b.totalPrice), 0)
  const totalNights = bookings
    .filter((b) => b.status === 'CHECKED_OUT')
    .reduce((sum, b) => {
      const nights = Math.ceil((b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)

  return {
    totalBookings,
    completedBookings,
    cancelledBookings,
    totalSpent,
    totalNights,
  }
}

/**
 * Obtenir les statistiques globales (admin)
 */
export async function getGlobalStatistics() {
  const bookings = await prisma.booking.findMany()
  const users = await prisma.user.count()
  const rooms = await prisma.room.count({ where: { isActive: true } })

  const totalRevenue = bookings
    .filter((b) => b.status === 'CHECKED_OUT')
    .reduce((sum, b) => sum + Number(b.totalPrice), 0)

  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length

  const averageBookingValue = bookings.length > 0
    ? totalRevenue / bookings.length
    : 0

  return {
    totalUsers: users,
    totalRooms: rooms,
    totalRevenue,
    activeBookings,
    averageBookingValue,
  }
}
