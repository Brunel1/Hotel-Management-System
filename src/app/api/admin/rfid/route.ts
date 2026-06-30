import { NextRequest, NextResponse } from 'next/server'
import { registerRFIDCard, validateRFIDCard, getUserRFIDCards, deactivateRFIDCard, reactivateRFIDCard, getCardAccessHistory, getRecentAccessLogs, updateCardAccessLevel } from '@/lib/rfid'
import { z } from 'zod'

// Schéma de validation pour l'enregistrement de carte
const cardSchema = z.object({
  userId: z.string(),
  cardNumber: z.string(),
  accessLevel: z.string(),
})

/**
 * Route API pour enregistrer une carte RFID (admin)
 * POST /api/admin/rfid
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = cardSchema.parse(body)

    // Enregistrer la carte
    const card = await registerRFIDCard(validatedData)

    return NextResponse.json(
      { message: 'Carte RFID enregistrée avec succès', card },
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
    console.error('Erreur lors de l&apos;enregistrement de la carte RFID:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l&apos;enregistrement de la carte RFID' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour valider une carte RFID (admin)
 * GET /api/admin/rfid/validate?cardNumber=
 */
export async function GET_VALIDATE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cardNumber = searchParams.get('cardNumber')

    if (!cardNumber) {
      return NextResponse.json(
        { error: 'cardNumber requis' },
        { status: 400 }
      )
    }

    const card = await validateRFIDCard(cardNumber)

    if (!card) {
      return NextResponse.json(
        { error: 'Carte invalide ou inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json(card, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la validation de la carte RFID:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la validation de la carte RFID' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les cartes RFID d'un utilisateur (admin)
 * GET /api/admin/rfid?userId=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (userId) {
      const cards = await getUserRFIDCards(userId)
      return NextResponse.json(cards, { status: 200 })
    }

    return NextResponse.json(
      { error: 'userId requis' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes RFID:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des cartes RFID' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour désactiver une carte RFID (admin)
 * PATCH /api/admin/rfid/deactivate
 */
export async function PATCH_DEACTIVATE(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId } = body

    if (!cardId) {
      return NextResponse.json(
        { error: 'cardId requis' },
        { status: 400 }
      )
    }

    const card = await deactivateRFIDCard(cardId)

    return NextResponse.json(card, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la désactivation de la carte RFID:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la désactivation de la carte RFID' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour réactiver une carte RFID (admin)
 * PATCH /api/admin/rfid/reactivate
 */
export async function PATCH_REACTIVATE(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId } = body

    if (!cardId) {
      return NextResponse.json(
        { error: 'cardId requis' },
        { status: 400 }
      )
    }

    const card = await reactivateRFIDCard(cardId)

    return NextResponse.json(card, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la réactivation de la carte RFID:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réactivation de la carte RFID' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour le niveau d'accès d'une carte (admin)
 * PATCH /api/admin/rfid
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId, accessLevel } = body

    if (!cardId || !accessLevel) {
      return NextResponse.json(
        { error: 'cardId et accessLevel requis' },
        { status: 400 }
      )
    }

    const card = await updateCardAccessLevel(cardId, accessLevel)

    return NextResponse.json(card, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte RFID:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la carte RFID' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer l'historique d'accès d'une carte (admin)
 * GET /api/admin/rfid/history?cardId=
 */
export async function GET_HISTORY(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cardId = searchParams.get('cardId')

    if (cardId) {
      const accessLogs = await getCardAccessHistory(cardId)
      return NextResponse.json(accessLogs, { status: 200 })
    }

    return NextResponse.json(
      { error: 'cardId requis' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération de l&apos;historique d&apos;accès:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l&apos;historique d&apos;accès' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les accès récents (admin)
 * GET /api/admin/rfid/logs?limit=
 */
export async function GET_LOGS(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit')
    const limitNum = limit ? parseInt(limit) : 50

    const accessLogs = await getRecentAccessLogs(limitNum)

    return NextResponse.json(accessLogs, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des accès récents:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des accès récents' },
      { status: 500 }
    )
  }
}
