import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des points de fidélité
 */

// Configuration des niveaux de fidélité
const LOYALTY_TIERS = {
  BRONZE: { minPoints: 0, discount: 0 },
  SILVER: { minPoints: 1000, discount: 0.05 }, // 5% de réduction
  GOLD: { minPoints: 5000, discount: 0.10 }, // 10% de réduction
  PLATINUM: { minPoints: 10000, discount: 0.15 }, // 15% de réduction
}

// Points gagnés par euro dépensé
const POINTS_PER_EURO = 10

/**
 * Obtenir ou créer les points de fidélité d'un utilisateur
 */
export async function getOrCreateLoyaltyPoints(userId: string) {
  let loyaltyPoints = await prisma.loyaltyPoint.findUnique({
    where: { userId },
  })

  if (!loyaltyPoints) {
    loyaltyPoints = await prisma.loyaltyPoint.create({
      data: {
        userId,
        points: 0,
        tier: 'BRONZE',
        totalEarned: 0,
        totalSpent: 0,
      },
    })
  }

  return loyaltyPoints
}

/**
 * Calculer le niveau de fidélité en fonction des points
 */
export function calculateTier(points: number): string {
  if (points >= LOYALTY_TIERS.PLATINUM.minPoints) return 'PLATINUM'
  if (points >= LOYALTY_TIERS.GOLD.minPoints) return 'GOLD'
  if (points >= LOYALTY_TIERS.SILVER.minPoints) return 'SILVER'
  return 'BRONZE'
}

/**
 * Mettre à jour le niveau de fidélité
 */
export async function updateLoyaltyTier(userId: string) {
  const loyaltyPoints = await getOrCreateLoyaltyPoints(userId)
  const newTier = calculateTier(loyaltyPoints.points)

  if (newTier !== loyaltyPoints.tier) {
    await prisma.loyaltyPoint.update({
      where: { userId },
      data: { tier: newTier },
    })
  }

  return newTier
}

/**
 * Ajouter des points de fidélité après une réservation
 */
export async function addLoyaltyPoints(userId: string, amount: number) {
  const pointsEarned = Math.floor(amount * POINTS_PER_EURO)

  const loyaltyPoints = await prisma.loyaltyPoint.update({
    where: { userId },
    data: {
      points: { increment: pointsEarned },
      totalEarned: { increment: pointsEarned },
    },
  })

  // Mettre à jour le niveau de fidélité
  await updateLoyaltyTier(userId)

  return loyaltyPoints
}

/**
 * Utiliser des points de fidélité pour une réduction
 */
export async function useLoyaltyPoints(userId: string, pointsToUse: number) {
  const loyaltyPoints = await getOrCreateLoyaltyPoints(userId)

  if (loyaltyPoints.points < pointsToUse) {
    throw new Error('Points insuffisants')
  }

  const updatedPoints = await prisma.loyaltyPoint.update({
    where: { userId },
    data: {
      points: { decrement: pointsToUse },
      totalSpent: { increment: pointsToUse },
    },
  })

  return updatedPoints
}

/**
 * Calculer la réduction basée sur le niveau de fidélité
 */
export function calculateLoyaltyDiscount(tier: string, amount: number): number {
  const tierConfig = LOYALTY_TIERS[tier as keyof typeof LOYALTY_TIERS]
  if (!tierConfig) return 0

  return amount * tierConfig.discount
}

/**
 * Calculer la réduction maximale en points (100 points = 1€)
 */
export function calculatePointsDiscount(points: number): number {
  return points / 100
}

/**
 * Obtenir la réduction totale (niveau + points)
 */
export async function calculateTotalDiscount(userId: string, amount: number): Promise<number> {
  const loyaltyPoints = await getOrCreateLoyaltyPoints(userId)
  
  // Réduction basée sur le niveau de fidélité
  const tierDiscount = calculateLoyaltyDiscount(loyaltyPoints.tier, amount)
  
  // Réduction basée sur les points (optionnel, peut être activé par l'utilisateur)
  const pointsDiscount = 0 // À implémenter selon les besoins
  
  return tierDiscount + pointsDiscount
}
