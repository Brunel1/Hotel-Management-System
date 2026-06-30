import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des préférences clients
 */

/**
 * Mettre à jour les préférences d'un client
 */
export async function updateCustomerPreferences(userId: string, data: {
  allergies?: string[]
  bedType?: string
  smokingPreference?: string
}) {
  const profile = await prisma.profile.update({
    where: { userId },
    data: {
      allergies: data.allergies,
      bedType: data.bedType,
      smokingPreference: data.smokingPreference,
    },
  })

  return profile
}

/**
 * Récupérer les préférences d'un client
 */
export async function getCustomerPreferences(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      allergies: true,
      bedType: true,
      smokingPreference: true,
    },
  })

  return profile
}

/**
 * Récupérer le profil complet d'un client avec ses préférences
 */
export async function getCustomerProfileWithPreferences(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  })

  return profile
}
