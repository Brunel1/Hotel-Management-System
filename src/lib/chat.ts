import { prisma } from '@/lib/prisma'

/**
 * Service de gestion du chat en ligne avec le personnel
 */

/**
 * Envoyer un message
 */
export async function sendMessage(data: {
  userId: string
  message: string
  isStaff?: boolean
}) {
  const chatMessage = await prisma.chatMessage.create({
    data: {
      userId: data.userId,
      message: data.message,
      isStaff: data.isStaff || false,
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
  })

  return chatMessage
}

/**
 * Récupérer les messages d'un utilisateur
 */
export async function getUserMessages(userId: string) {
  const messages = await prisma.chatMessage.findMany({
    where: { userId },
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

  return messages
}

/**
 * Marquer les messages d'un utilisateur comme lus
 */
export async function markMessagesAsRead(userId: string) {
  await prisma.chatMessage.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}

/**
 * Récupérer tous les messages non lus (admin)
 */
export async function getUnreadMessages() {
  const messages = await prisma.chatMessage.findMany({
    where: { isRead: false },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return messages
}

/**
 * Récupérer tous les messages (admin)
 */
export async function getAllMessages() {
  const messages = await prisma.chatMessage.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return messages
}

/**
 * Supprimer un message (admin)
 */
export async function deleteMessage(messageId: string) {
  await prisma.chatMessage.delete({
    where: { id: messageId },
  })
}
