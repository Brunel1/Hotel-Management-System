import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des offres spéciales
 */

/**
 * Créer une offre spéciale
 */
export async function createSpecialOffer(data: {
  name: string
  type: 'LAST_MINUTE' | 'LONG_STAY' | 'EARLY_BIRD'
  discount: number
  minNights?: number
  maxNights?: number
  minDaysBefore?: number
  validFrom: Date
  validUntil: Date
}) {
  const specialOffer = await prisma.specialOffer.create({
    data,
  })

  return specialOffer
}

/**
 * Récupérer toutes les offres spéciales actives
 */
export async function getActiveSpecialOffers() {
  const now = new Date()

  const specialOffers = await prisma.specialOffer.findMany({
    where: {
      isActive: true,
      validFrom: { lte: now },
      validUntil: { gte: now },
    },
    orderBy: { discount: 'desc' },
  })

  return specialOffers
}

/**
 * Récupérer toutes les offres spéciales
 */
export async function getAllSpecialOffers() {
  const specialOffers = await prisma.specialOffer.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return specialOffers
}

/**
 * Mettre à jour une offre spéciale
 */
export async function updateSpecialOffer(id: string, data: {
  name?: string
  type?: 'LAST_MINUTE' | 'LONG_STAY' | 'EARLY_BIRD'
  discount?: number
  minNights?: number
  maxNights?: number
  minDaysBefore?: number
  validFrom?: Date
  validUntil?: Date
  isActive?: boolean
}) {
  const specialOffer = await prisma.specialOffer.update({
    where: { id },
    data,
  })

  return specialOffer
}

/**
 * Supprimer une offre spéciale
 */
export async function deleteSpecialOffer(id: string) {
  await prisma.specialOffer.delete({
    where: { id },
  })
}

/**
 * Calculer la meilleure offre applicable pour une réservation
 */
export async function getBestSpecialOffer(checkIn: Date, checkOut: Date): Promise<{ offer: any; discount: number } | null> {
  const now = new Date()
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const specialOffers = await prisma.specialOffer.findMany({
    where: {
      isActive: true,
      validFrom: { lte: now },
      validUntil: { gte: now },
    },
  })

  let bestOffer = null
  let bestDiscount = 0

  for (const offer of specialOffers) {
    let applicable = false
    let discount = Number(offer.discount)

    switch (offer.type) {
      case 'LAST_MINUTE':
        // Offre de dernière minute: applicable si le check-in est dans X jours ou moins
        if (offer.minDaysBefore && daysUntilCheckIn <= offer.minDaysBefore) {
          applicable = true
        }
        break

      case 'LONG_STAY':
        // Offre séjour prolongé: applicable si le séjour dure au moins X nuits
        if (offer.minNights && nights >= offer.minNights) {
          applicable = true
        }
        break

      case 'EARLY_BIRD':
        // Offre early bird: applicable si le check-in est dans X jours ou plus
        if (offer.minDaysBefore && daysUntilCheckIn >= offer.minDaysBefore) {
          applicable = true
        }
        break
    }

    if (applicable && discount > bestDiscount) {
      bestOffer = offer
      bestDiscount = discount
    }
  }

  return bestOffer ? { offer: bestOffer, discount: bestDiscount } : null
}
