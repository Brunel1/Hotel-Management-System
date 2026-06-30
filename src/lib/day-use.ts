import { prisma } from '@/lib/prisma'

/**
 * Service de gestion du pricing par tranche horaire (day-use)
 */

/**
 * Calculer le prix pour une réservation day-use (par tranche horaire)
 */
export async function calculateDayUsePrice(
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  })

  if (!room) {
    throw new Error('Chambre non trouvée')
  }

  // Calculer la durée en heures
  const durationMs = checkOut.getTime() - checkIn.getTime()
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60))

  // Prix horaire: 30% du prix par nuit divisé par 24
  const hourlyRate = (Number(room.pricePerNight) * 0.3) / 24

  // Calculer le prix total
  const totalPrice = hourlyRate * durationHours

  return Math.round(totalPrice * 100) / 100
}

/**
 * Vérifier si une chambre est disponible pour un day-use
 */
export async function isDayUseAvailable(
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  // Vérifier qu'il n'y a pas de réservation qui chevauche cette période
  const conflictingBookings = await prisma.booking.count({
    where: {
      roomId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
      },
      OR: [
        {
          checkIn: { lte: checkIn },
          checkOut: { gt: checkIn },
        },
        {
          checkIn: { lt: checkOut },
          checkOut: { gte: checkOut },
        },
        {
          checkIn: { gte: checkIn },
          checkOut: { lte: checkOut },
        },
      ],
    },
  })

  return conflictingBookings === 0
}
