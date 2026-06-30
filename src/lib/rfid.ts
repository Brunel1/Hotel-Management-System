import { prisma } from '@/lib/prisma'

/**
 * Service de gestion du système de contrôle d'accès (cartes RFID)
 */

/**
 * Enregistrer une nouvelle carte RFID
 */
export async function registerRFIDCard(data: {
  userId: string
  cardNumber: string
  accessLevel: string
}) {
  const card = await prisma.rFIDCard.create({
    data: {
      userId: data.userId,
      cardNumber: data.cardNumber,
      accessLevel: data.accessLevel,
      isActive: true,
    },
  })

  return card
}

/**
 * Valider une carte RFID
 */
export async function validateRFIDCard(cardNumber: string) {
  const card = await prisma.rFIDCard.findUnique({
    where: { cardNumber },
    include: { user: true },
  })

  if (!card || !card.isActive) {
    return null
  }

  return card
}

/**
 * Enregistrer un accès
 */
export async function logAccess(data: {
  cardId: string
  location: string
  accessGranted: boolean
}) {
  const accessLog = await prisma.accessLog.create({
    data: {
      cardId: data.cardId,
      location: data.location,
      accessGranted: data.accessGranted,
    },
  })

  return accessLog
}

/**
 * Récupérer les cartes RFID d'un utilisateur
 */
export async function getUserRFIDCards(userId: string) {
  const cards = await prisma.rFIDCard.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return cards
}

/**
 * Désactiver une carte RFID
 */
export async function deactivateRFIDCard(cardId: string) {
  const card = await prisma.rFIDCard.update({
    where: { id: cardId },
    data: { isActive: false },
  })

  return card
}

/**
 * Réactiver une carte RFID
 */
export async function reactivateRFIDCard(cardId: string) {
  const card = await prisma.rFIDCard.update({
    where: { id: cardId },
    data: { isActive: true },
  })

  return card
}

/**
 * Récupérer l'historique d'accès d'une carte
 */
export async function getCardAccessHistory(cardId: string) {
  const accessLogs = await prisma.accessLog.findMany({
    where: { cardId },
    orderBy: { timestamp: 'desc' },
    take: 100,
  })

  return accessLogs
}

/**
 * Récupérer tous les accès récents
 */
export async function getRecentAccessLogs(limit: number = 50) {
  const accessLogs = await prisma.accessLog.findMany({
    include: {
      card: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  })

  return accessLogs
}

/**
 * Mettre à jour le niveau d'accès d'une carte
 */
export async function updateCardAccessLevel(cardId: string, accessLevel: string) {
  const card = await prisma.rFIDCard.update({
    where: { id: cardId },
    data: { accessLevel },
  })

  return card
}
