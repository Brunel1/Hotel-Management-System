import { prisma } from '@/lib/prisma'

/**
 * Service de gestion de la liste d'attente
 */

/**
 * Ajouter un utilisateur à la liste d'attente
 */
export async function addToWaitlist(data: {
  userId: string
  roomId: string
  checkIn: Date
  checkOut: Date
  adults: number
  children: number
}) {
  const waitlist = await prisma.waitlist.create({
    data: {
      userId: data.userId,
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      adults: data.adults,
      children: data.children,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
    },
  })

  return waitlist
}

/**
 * Récupérer toutes les entrées de la liste d'attente pour une chambre
 */
export async function getWaitlistForRoom(roomId: string) {
  const waitlist = await prisma.waitlist.findMany({
    where: {
      roomId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return waitlist
}

/**
 * Récupérer toutes les entrées de la liste d'attente pour un utilisateur
 */
export async function getUserWaitlist(userId: string) {
  const waitlist = await prisma.waitlist.findMany({
    where: {
      userId,
    },
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
          pricePerNight: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return waitlist
}

/**
 * Mettre à jour le statut d'une entrée de la liste d'attente
 */
export async function updateWaitlistStatus(waitlistId: string, status: string) {
  const waitlist = await prisma.waitlist.update({
    where: { id: waitlistId },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
    },
  })

  return waitlist
}

/**
 * Supprimer une entrée de la liste d'attente
 */
export async function removeFromWaitlist(waitlistId: string) {
  await prisma.waitlist.delete({
    where: { id: waitlistId },
  })
}

/**
 * Vérifier si une chambre est disponible pour les dates demandées
 */
export async function isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
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

/**
 * Notifier les utilisateurs en liste d'attente quand une chambre devient disponible
 */
export async function notifyWaitlistForRoom(roomId: string, checkIn: Date, checkOut: Date) {
  const waitlist = await prisma.waitlist.findMany({
    where: {
      roomId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const notifiedUsers = []

  for (const entry of waitlist) {
    const isAvailable = await isRoomAvailable(roomId, entry.checkIn, entry.checkOut)
    
    if (isAvailable) {
      // Mettre à jour le statut
      await prisma.waitlist.update({
        where: { id: entry.id },
        data: { status: 'AVAILABLE' },
      })

      notifiedUsers.push({
        userId: entry.userId,
        email: entry.user.email,
        checkIn: entry.checkIn,
        checkOut: entry.checkOut,
      })
    }
  }

  return notifiedUsers
}
