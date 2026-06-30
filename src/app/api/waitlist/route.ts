import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { addToWaitlist, getUserWaitlist } from '@/lib/waitlist'
import { z } from 'zod'

// Schéma de validation pour l'ajout à la liste d'attente
const waitlistSchema = z.object({
  roomId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().min(1),
  children: z.number().min(0),
})

/**
 * Route API pour ajouter un utilisateur à la liste d'attente
 * POST /api/waitlist
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    // Valider les données
    const validatedData = waitlistSchema.parse(body)

    // Convertir les dates
    const checkInDate = new Date(validatedData.checkIn)
    const checkOutDate = new Date(validatedData.checkOut)

    // Vérifier que les dates sont valides
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'La date de départ doit être après la date d&apos;arrivée' },
        { status: 400 }
      )
    }

    // Ajouter à la liste d'attente
    const waitlist = await addToWaitlist({
      userId,
      roomId: validatedData.roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: validatedData.adults,
      children: validatedData.children,
    })

    return NextResponse.json(
      { message: 'Ajouté à la liste d&apos;attente avec succès', waitlist },
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
    console.error('Erreur lors de l&apos;ajout à la liste d&apos;attente:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l&apos;ajout à la liste d&apos;attente' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer la liste d'attente de l'utilisateur
 * GET /api/waitlist
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const waitlist = await getUserWaitlist(userId)

    return NextResponse.json(waitlist, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste d&apos;attente:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de la liste d&apos;attente' },
      { status: 500 }
    )
  }
}
