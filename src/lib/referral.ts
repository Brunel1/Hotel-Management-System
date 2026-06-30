import { prisma } from '@/lib/prisma'

/**
 * Service de gestion du programme de parrainage
 */

/**
 * Générer un code de parrainage unique
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Créer un code de parrainage pour un utilisateur
 */
export async function createReferralCode(userId: string) {
  const code = generateReferralCode()

  const referral = await prisma.referral.create({
    data: {
      userId,
      code,
      isActive: true,
    },
  })

  return referral
}

/**
 * Récupérer le code de parrainage d'un utilisateur
 */
export async function getUserReferralCode(userId: string) {
  const referral = await prisma.referral.findUnique({
    where: { userId },
  })

  if (!referral) {
    return await createReferralCode(userId)
  }

  return referral
}

/**
 * Valider un code de parrainage
 */
export async function validateReferralCode(code: string) {
  const referral = await prisma.referral.findUnique({
    where: { code },
    include: { user: true },
  })

  if (!referral || !referral.isActive) {
    return null
  }

  return referral
}

/**
 * Enregistrer une utilisation de code de parrainage
 */
export async function useReferralCode(referrerId: string, referredUserId: string) {
  const referral = await prisma.referral.findUnique({
    where: { userId: referrerId },
  })

  if (!referral) {
    throw new Error('Code de parrainage introuvable')
  }

  // Créer l'enregistrement d'utilisation
  const referralUse = await prisma.referralUse.create({
    data: {
      referralId: referral.id,
      referredUserId,
    },
  })

  // Accorder des points de fidélité au parrain
  await prisma.loyaltyPoint.create({
    data: {
      userId: referrerId,
      points: 100, // 100 points pour chaque parrainage réussi
      reason: 'Parrainage',
    },
  })

  // Accorder des points de fidélité au filleul
  await prisma.loyaltyPoint.create({
    data: {
      userId: referredUserId,
      points: 50, // 50 points pour avoir utilisé un code
      reason: 'Code de parrainage utilisé',
    },
  })

  return referralUse
}

/**
 * Récupérer les statistiques de parrainage d'un utilisateur
 */
export async function getReferralStats(userId: string) {
  const referral = await prisma.referral.findUnique({
    where: { userId },
    include: {
      uses: true,
    },
  })

  if (!referral) {
    return {
      code: null,
      totalUses: 0,
      totalPointsEarned: 0,
    }
  }

  const totalUses = referral.uses.length
  const totalPointsEarned = totalUses * 100

  return {
    code: referral.code,
    totalUses,
    totalPointsEarned,
  }
}

/**
 * Désactiver un code de parrainage
 */
export async function deactivateReferralCode(userId: string) {
  const referral = await prisma.referral.update({
    where: { userId },
    data: { isActive: false },
  })

  return referral
}
