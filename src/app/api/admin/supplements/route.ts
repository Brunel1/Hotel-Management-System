import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createSupplement, getAllSupplements, updateSupplement, deactivateSupplement } from '@/lib/supplements'

// Schéma de validation pour la création de supplément
const createSupplementSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être positif'),
  type: z.enum(['BREAKFAST', 'PARKING', 'SPA', 'OTHER']),
})

/**
 * Route API pour récupérer tous les suppléments
 * GET /api/admin/supplements
 */
export async function GET() {
  try {
    const supplements = await getAllSupplements()
    return NextResponse.json(supplements, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des suppléments:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des suppléments' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour créer un nouveau supplément
 * POST /api/admin/supplements
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSupplementSchema.parse(body)

    const supplement = await createSupplement(validatedData)

    return NextResponse.json(
      { message: 'Supplément créé avec succès', supplement },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création du supplément:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du supplément' },
      { status: 500 }
    )
  }
}
