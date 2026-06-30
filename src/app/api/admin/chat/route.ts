import { NextRequest, NextResponse } from 'next/server'
import { getAllMessages, getUnreadMessages, deleteMessage, sendMessage } from '@/lib/chat'

/**
 * Route API pour récupérer tous les messages (admin)
 * GET /api/admin/chat?unread=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const unread = searchParams.get('unread') === 'true'

    const messages = unread ? await getUnreadMessages() : await getAllMessages()

    return NextResponse.json(messages, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des messages' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour envoyer un message en tant que staff (admin)
 * POST /api/admin/chat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message } = body

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId et message requis' },
        { status: 400 }
      )
    }

    const chatMessage = await sendMessage({
      userId,
      message,
      isStaff: true,
    })

    return NextResponse.json(
      { message: 'Message envoyé avec succès', chatMessage },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de l&apos;envoi du message:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l&apos;envoi du message' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer un message (admin)
 * DELETE /api/admin/chat?id=
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    await deleteMessage(id)

    return NextResponse.json(
      { message: 'Message supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du message' },
      { status: 500 }
    )
  }
}
