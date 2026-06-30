import { NextRequest, NextResponse } from 'next/server'
import { createSpecialOffer, getActiveSpecialOffers, getAllSpecialOffers, updateSpecialOffer, deleteSpecialOffer } from '@/lib/special-offers'
import { z } from 'zod'

// Schéma de validation pour la création d'une offre spéciale
const specialOfferSchema = z.object({
  name: z.string(),
  type: z.enum(['LAST_MINUTE', 'LONG_STAY', 'EARLY_BIRD']),
  discount: z.number().min(0).max(100),
  minNights: z.number().optional(),
  maxNights: z.number().optional(),
  minDaysBefore: z.number().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
})

/**
 * Route API pour créer une offre spéciale
 * POST /api/admin/special-offers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = specialOfferSchema.parse(body)

    // Convertir les dates
    const validFromDate = new Date(validatedData.validFrom)
    const validUntilDate = new Date(validatedData.validUntil)

    // Créer l'offre spéciale
    const specialOffer = await createSpecialOffer({
      ...validatedData,
      validFrom: validFromDate,
      validUntil: validUntilDate,
    })

    return NextResponse.json(
      { message: 'Offre spéciale créée avec succès', specialOffer },
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
    console.error('Erreur lors de la création de l&apos;offre spéciale:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l&apos;offre spéciale' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer toutes les offres spéciales
 * GET /api/admin/special-offers
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const specialOffers = activeOnly 
      ? await getActiveSpecialOffers()
      : await getAllSpecialOffers()

    return NextResponse.json(specialOffers, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des offres spéciales:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des offres spéciales' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour une offre spéciale
 * PATCH /api/admin/special-offers
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const specialOffer = await updateSpecialOffer(id, data)

    return NextResponse.json(specialOffer, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l&apos;offre spéciale:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l&apos;offre spéciale' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer une offre spéciale
 * DELETE /api/admin/special-offers?id=
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

    await deleteSpecialOffer(id)

    return NextResponse.json(
      { message: 'Offre spéciale supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de l&apos;offre spéciale:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l&apos;offre spéciale' },
      { status: 500 }
    )
  }
}
