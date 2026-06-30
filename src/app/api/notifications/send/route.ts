import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'
import webpush from 'web-push'

/**
 * Route API pour l'envoi de notifications push
 * POST /api/notifications/send
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR' && userRole !== 'STAFF') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, body: message, userId: targetUserId, segment, type, priority, data } = body

    // Validation
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Titre et message requis' },
        { status: 400 }
      )
    }

    // Configurer VAPID si ce n'est pas déjà fait
    webpush.setVapidDetails(
      'mailto:contact@hotel-madagascar.mg',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    )

    // Récupérer les abonnements aux notifications
    let subscriptions: any[] = []

    if (targetUserId) {
      // Abonnement d'un utilisateur spécifique
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: { notificationSubscriptions: true },
      })
      if (user) {
        subscriptions = user.notificationSubscriptions
      }
    } else if (segment) {
      // Abonnements par segment
      const users = await prisma.user.findMany({
        where: { role: segment === 'all' ? undefined : segment },
        include: { notificationSubscriptions: true },
      })
      subscriptions = users.flatMap(u => u.notificationSubscriptions)
    }

    // Envoyer les notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          }

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title,
              body: message,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              data,
              type,
              priority,
              timestamp: new Date().toISOString(),
            })
          )

          return { success: true, subscriptionId: sub.id }
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la notification:', error)
          return { success: false, subscriptionId: sub.id, error }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length
    const failed = results.length - successful

    return NextResponse.json(
      {
        message: 'Notifications envoyées',
        total: results.length,
        successful,
        failed,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi des notifications' },
      { status: 500 }
    )
  }
}
