import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, sendPushNotification } from '@/lib/notifications'

/**
 * Route API pour récupérer les notifications de l'utilisateur
 * GET /api/notifications
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const notifications = await getUserNotifications(userId)

    return NextResponse.json(notifications, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour marquer une notification comme lue
 * PATCH /api/notifications
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, markAll } = body

    if (markAll) {
      const userId = getUserId(request)
      await markAllNotificationsAsRead(userId)
      return NextResponse.json(
        { message: 'Toutes les notifications marquées comme lues' },
        { status: 200 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const notification = await markNotificationAsRead(id)

    return NextResponse.json(notification, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la notification' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour envoyer une notification (admin)
 * POST /api/notifications/send
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, body: notificationBody, icon, data } = body

    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'title et body requis' },
        { status: 400 }
      )
    }

    const result = await sendPushNotification({
      userId,
      title,
      body: notificationBody,
      icon,
      data,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de l&apos;envoi de la notification:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l&apos;envoi de la notification' },
      { status: 500 }
    )
  }
}
