import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { sendMessage, getUserMessages, markMessagesAsRead } from '@/lib/chat'
import { z } from 'zod'

// Schéma de validation pour l'envoi de message
const messageSchema = z.object({
  message: z.string().min(1),
  isStaff: z.boolean().optional(),
})

/**
 * Route API pour envoyer un message
 * POST /api/chat
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    // Valider les données
    const validatedData = messageSchema.parse(body)

    // Envoyer le message
    const chatMessage = await sendMessage({
      userId,
      ...validatedData,
    })

    return NextResponse.json(
      { message: 'Message envoyé avec succès', chatMessage },
      { status: 201 }
    )
  } catch (error) {
    // Gérer les erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    // Gérer les autres erreurs
    console.error('Erreur lors de l&apos;envoi du message:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l&apos;envoi du message' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les messages de l'utilisateur
 * GET /api/chat
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const messages = await getUserMessages(userId)

    // Marquer les messages comme lus
    await markMessagesAsRead(userId)

    return NextResponse.json(messages, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des messages' },
      { status: 500 }
    )
  }
}
