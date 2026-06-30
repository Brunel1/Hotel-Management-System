import { prisma } from '@/lib/prisma'

/**
 * Service de tarification dynamique
 * Calcule le prix d'une chambre en fonction de la saison et de la disponibilité
 */

/**
 * Récupérer la saison actuelle pour une date donnée
 */
export async function getCurrentSeason(date: Date = new Date()) {
  const seasons = await prisma.season.findMany({
    where: {
      isActive: true,
      startDate: { lte: date },
      endDate: { gte: date },
    },
    orderBy: { createdAt: 'desc' },
  })

  return seasons[0] || null
}

/**
 * Récupérer la règle de tarification pour une chambre et une saison
 */
export async function getPricingRule(roomType: string, seasonId: string | null) {
  if (!seasonId) return null

  const rule = await prisma.pricingRule.findFirst({
    where: {
      seasonId,
      roomType: roomType as 'STANDARD' | 'SUPERIOR' | 'SUITE' | 'DELUXE' | 'FAMILY',
      isActive: true,
    },
  })

  return rule
}

/**
 * Calculer le prix dynamique d'une chambre pour une période donnée
 */
export async function calculateDynamicPrice(
  basePrice: number,
  roomType: string,
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  let totalPrice = 0
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Calculer le prix pour chaque nuit
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkIn)
    currentDate.setDate(currentDate.getDate() + i)

    const season = await getCurrentSeason(currentDate)
    const pricingRule = season ? await getPricingRule(roomType, season.id) : null

    let multiplier = 1.0

    if (pricingRule) {
      multiplier = Number(pricingRule.multiplier)
    } else if (season) {
      multiplier = Number(season.multiplier)
    }

    // Ajuster le prix selon le multiplicateur
    totalPrice += basePrice * multiplier
  }

  return totalPrice
}

/**
 * Calculer le taux d'occupation pour une chambre sur une période
 */
export async function calculateOccupancyRate(
  roomId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const totalNights = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

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
 * Ajuster le prix selon l'occupation (demand-based pricing)
 */
export async function adjustPriceByOccupancy(
  price: number,
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  const occupancyRate = await calculateOccupancyRate(roomId, checkIn, checkOut)

  // Si l'occupation est élevée (>80%), augmenter le prix de 10-20%
  if (occupancyRate > 80) {
    return price * 1.2
  }

  // Si l'occupation est moyenne (50-80%), augmenter légèrement le prix de 5-10%
  if (occupancyRate > 50) {
    return price * 1.1
  }

  // Si l'occupation est faible (<30%), réduire le prix de 10-20%
  if (occupancyRate < 30) {
    return price * 0.8
  }

  return price
}

/**
 * Calculer le prix final avec tous les ajustements
 */
export async function calculateFinalPrice(
  basePrice: number,
  roomId: string,
  roomType: string,
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  // Calculer le prix dynamique selon la saison
  let price = await calculateDynamicPrice(basePrice, roomType, checkIn, checkOut)

  // Ajuster le prix selon l'occupation
  price = await adjustPriceByOccupancy(price, roomId, checkIn, checkOut)

  return Math.round(price * 100) / 100 // Arrondir à 2 décimales
}
