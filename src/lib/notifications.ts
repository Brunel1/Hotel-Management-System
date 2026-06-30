import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des notifications push
 */

/**
 * Enregistrer un abonnement aux notifications push
 */
export async function subscribeToPushNotifications(data: {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}) {
  const subscription = await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId: data.userId,
        endpoint: data.endpoint,
      },
    },
    update: {
      keys: data.keys,
    },
    create: {
      userId: data.userId,
      endpoint: data.endpoint,
      keys: data.keys,
    },
  })

  return subscription
}

/**
 * Récupérer les abonnements d'un utilisateur
 */
export async function getUserPushSubscriptions(userId: string) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  return subscriptions
}

/**
 * Supprimer un abonnement
 */
export async function deletePushSubscription(subscriptionId: string) {
  await prisma.pushSubscription.delete({
    where: { id: subscriptionId },
  })
}

/**
 * Envoyer une notification push
 * Note: Cette fonction nécessite une implémentation avec un service comme VAPID
 */
export async function sendPushNotification(data: {
  userId?: string
  title: string
  body: string
  icon?: string
  data?: any
}) {
  let subscriptions

  if (data.userId) {
    subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: data.userId },
    })
  } else {
    // Envoyer à tous les abonnés
    subscriptions = await prisma.pushSubscription.findMany()
  }

  // Note: L'implémentation réelle nécessiterait l'utilisation de web-push
  // et la configuration VAPID. Pour l'instant, nous enregistrons la notification
  // dans l'historique.

  for (const subscription of subscriptions) {
    await prisma.notification.create({
      data: {
        userId: subscription.userId,
        title: data.title,
        body: data.body,
        icon: data.icon,
        data: data.data ? JSON.stringify(data.data) : null,
        read: false,
      },
    })
  }

  return { sent: subscriptions.length }
}

/**
 * Récupérer les notifications d'un utilisateur
 */
export async function getUserNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return notifications
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string) {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })

  return notification
}

/**
 * Marquer toutes les notifications d'un utilisateur comme lues
 */
export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId },
    data: { read: true },
  })
}
