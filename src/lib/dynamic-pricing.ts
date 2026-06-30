import { prisma } from '@/lib/prisma'

/**
 * Service de tarification dynamique en temps réel
 * Ajuste les prix en fonction de la demande actuelle
 */

/**
 * Calculer le taux d'occupation actuel pour une période donnée
 */
export async function getCurrentOccupancyRate(roomId: string, daysAhead: number = 30): Promise<number> {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + daysAhead)

  const totalNights = daysAhead

  const bookedNights = await prisma.booking.count({
    where: {
      roomId,
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'] },
      OR: [
        {
          checkIn: { lte: endDate },
          checkOut: { gte: startDate },
        },
      ],
    },
  })

  return totalNights > 0 ? (bookedNights / totalNights) * 100 : 0
}

/**
 * Calculer le multiplicateur de prix en temps réel selon la demande
 */
export async function calculateRealTimePriceMultiplier(roomId: string, basePrice: number): Promise<number> {
  const occupancyRate = await getCurrentOccupancyRate(roomId)

  // Ajuster le prix selon l'occupation
  if (occupancyRate >= 90) {
    return 1.3 // +30% si occupation très élevée
  } else if (occupancyRate >= 75) {
    return 1.2 // +20% si occupation élevée
  } else if (occupancyRate >= 60) {
    return 1.1 // +10% si occupation moyenne-élevée
  } else if (occupancyRate >= 40) {
    return 1.0 // Prix normal
  } else if (occupancyRate >= 25) {
    return 0.9 // -10% si occupation moyenne-faible
  } else {
    return 0.8 // -20% si occupation faible
  }
}

/**
 * Calculer le prix en temps réel pour une chambre
 */
export async function calculateRealTimePrice(roomId: string, basePrice: number): Promise<number> {
  const multiplier = await calculateRealTimePriceMultiplier(roomId, basePrice)
  const realTimePrice = basePrice * multiplier
  return Math.round(realTimePrice * 100) / 100
}

/**
 * Récupérer les prix en temps réel pour toutes les chambres
 */
export async function getAllRealTimePrices(): Promise<Array<{ roomId: string; roomNumber: string; basePrice: number; realTimePrice: number; occupancyRate: number }>> {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
  })

  const prices = await Promise.all(
    rooms.map(async (room) => {
      const occupancyRate = await getCurrentOccupancyRate(room.id)
      const realTimePrice = await calculateRealTimePrice(room.id, Number(room.pricePerNight))
      return {
        roomId: room.id,
        roomNumber: room.number,
        basePrice: Number(room.pricePerNight),
        realTimePrice,
        occupancyRate,
      }
    })
  )

  return prices
}

/**
 * Mettre à jour le prix d'une chambre en temps réel
 */
export async function updateRoomRealTimePrice(roomId: string): Promise<void> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  })

  if (!room) return

  const realTimePrice = await calculateRealTimePrice(roomId, Number(room.pricePerNight))

  // Note: Nous ne mettons pas à jour le prix de base dans la base de données
  // Le prix en temps réel est calculé à la volée lors de la réservation
  // Cette fonction peut être utilisée pour journaliser les prix ou pour un cache
}

/**
 * Récupérer les tendances de prix pour une chambre
 */
export async function getPriceTrends(roomId: string, days: number = 30): Promise<Array<{ date: string; price: number; occupancyRate: number }>> {
  const trends: Array<{ date: string; price: number; occupancyRate: number }> = []

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  })

  if (!room) return trends

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)

    const occupancyRate = await getCurrentOccupancyRate(roomId, days)
    const multiplier = await calculateRealTimePriceMultiplier(roomId, Number(room.pricePerNight))
    const price = Number(room.pricePerNight) * multiplier

    trends.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
      occupancyRate,
    })
  }

  return trends
}
