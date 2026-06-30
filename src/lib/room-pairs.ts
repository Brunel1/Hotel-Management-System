import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des chambres jumelées pour les familles
 */

/**
 * Créer une paire de chambres jumelées
 */
export async function createRoomPair(data: {
  roomId1: string
  roomId2: string
  name: string
  description?: string
  discount?: number
}) {
  const roomPair = await prisma.roomPair.create({
    data: {
      roomId1: data.roomId1,
      roomId2: data.roomId2,
      name: data.name,
      description: data.description,
      discount: data.discount || 0,
    },
    include: {
      room1: true,
      room2: true,
    },
  })

  return roomPair
}

/**
 * Récupérer toutes les paires de chambres
 */
export async function getRoomPairs() {
  const roomPairs = await prisma.roomPair.findMany({
    where: { isActive: true },
    include: {
      room1: true,
      room2: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return roomPairs
}

/**
 * Récupérer une paire de chambres par ID
 */
export async function getRoomPairById(id: string) {
  const roomPair = await prisma.roomPair.findUnique({
    where: { id },
    include: {
      room1: true,
      room2: true,
    },
  })

  return roomPair
}

/**
 * Mettre à jour une paire de chambres
 */
export async function updateRoomPair(id: string, data: {
  name?: string
  description?: string
  discount?: number
  isActive?: boolean
}) {
  const roomPair = await prisma.roomPair.update({
    where: { id },
    data,
    include: {
      room1: true,
      room2: true,
    },
  })

  return roomPair
}

/**
 * Supprimer une paire de chambres
 */
export async function deleteRoomPair(id: string) {
  await prisma.roomPair.delete({
    where: { id },
  })
}

/**
 * Vérifier si une paire de chambres est disponible pour les dates demandées
 */
export async function isRoomPairAvailable(roomPairId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
  const roomPair = await prisma.roomPair.findUnique({
    where: { id: roomPairId },
    include: {
      room1: true,
      room2: true,
    },
  })

  if (!roomPair) {
    return false
  }

  // Vérifier la disponibilité des deux chambres
  const room1Bookings = await prisma.booking.count({
    where: {
      roomId: roomPair.roomId1,
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

  const room2Bookings = await prisma.booking.count({
    where: {
      roomId: roomPair.roomId2,
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

  return room1Bookings === 0 && room2Bookings === 0
}

/**
 * Calculer le prix pour une paire de chambres avec réduction
 */
export async function calculateRoomPairPrice(roomPairId: string, checkIn: Date, checkOut: Date): Promise<number> {
  const roomPair = await prisma.roomPair.findUnique({
    where: { id: roomPairId },
    include: {
      room1: true,
      room2: true,
    },
  })

  if (!roomPair) {
    throw new Error('Paire de chambres non trouvée')
  }

  // Calculer le nombre de nuits
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  // Calculer le prix de base
  const basePrice = (Number(roomPair.room1.pricePerNight) + Number(roomPair.room2.pricePerNight)) * nights

  // Appliquer la réduction
  const discount = Number(roomPair.discount)
  const finalPrice = basePrice * (1 - discount / 100)

  return Math.round(finalPrice * 100) / 100
}
