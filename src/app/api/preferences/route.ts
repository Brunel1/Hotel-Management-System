import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { updateCustomerPreferences, getCustomerPreferences } from '@/lib/preferences'
import { z } from 'zod'

// Schéma de validation pour les préférences
const preferencesSchema = z.object({
  allergies: z.array(z.string()).optional(),
  bedType: z.string().optional(),
  smokingPreference: z.string().optional(),
})

/**
 * Route API pour mettre à jour les préférences du client
 * PATCH /api/preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    // Valider les données
    const validatedData = preferencesSchema.parse(body)

    // Mettre à jour les préférences
    const profile = await updateCustomerPreferences(userId, validatedData)

    return NextResponse.json(
      { message: 'Préférences mises à jour avec succès', profile },
      { status: 200 }
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
    console.error('Erreur lors de la mise à jour des préférences:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour des préférences' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les préférences du client
 * GET /api/preferences
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const preferences = await getCustomerPreferences(userId)

    return NextResponse.json(preferences, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des préférences' },
      { status: 500 }
    )
  }
}
