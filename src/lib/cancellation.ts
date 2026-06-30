import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des pénalités d'annulation
 */

/**
 * Calculer la pénalité d'annulation selon la politique en vigueur
 */
export async function calculateCancellationPenalty(
  totalPrice: number,
  checkInDate: Date
): Promise<{ penaltyAmount: number; policyName: string; policyDescription: string }> {
  // Récupérer toutes les politiques d'annulation actives
  const policies = await prisma.cancellationPolicy.findMany({
    where: { isActive: true },
    orderBy: { hoursBeforeCheckIn: 'asc' },
  })

  const now = new Date()
  const hoursUntilCheckIn = Math.floor((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60))

  // Trouver la politique applicable
  let applicablePolicy = policies.find((policy) => hoursUntilCheckIn < policy.hoursBeforeCheckIn)

  // Si aucune politique n'est applicable, utiliser la politique la plus stricte
  if (!applicablePolicy && policies.length > 0) {
    applicablePolicy = policies[policies.length - 1]
  }

  // Si aucune politique n'existe, pas de pénalité
  if (!applicablePolicy) {
    return {
      penaltyAmount: 0,
      policyName: 'Sans pénalité',
      policyDescription: 'Aucune pénalité d\'annulation',
    }
  }

  const penaltyAmount = Number(totalPrice) * Number(applicablePolicy.penaltyPercentage)

  return {
    penaltyAmount: Math.round(penaltyAmount * 100) / 100,
    policyName: applicablePolicy.name,
    policyDescription: applicablePolicy.description || `Pénalité de ${Number(applicablePolicy.penaltyPercentage) * 100}%`,
  }
}

/**
 * Appliquer la pénalité d'annulation lors de l'annulation d'une réservation
 */
export async function applyCancellationPenalty(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { room: true },
  })

  if (!booking) {
    throw new Error('Réservation non trouvée')
  }

  const { penaltyAmount, policyName, policyDescription } = await calculateCancellationPenalty(
    Number(booking.totalPrice),
    booking.checkIn
  )

  // Mettre à jour la réservation avec les informations de pénalité
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      specialRequests: `${booking.specialRequests || ''}\n\nPénalité d'annulation: ${penaltyAmount}€ (${policyName})`,
    },
  })

  return {
    penaltyAmount,
    policyName,
    policyDescription,
  }
}
