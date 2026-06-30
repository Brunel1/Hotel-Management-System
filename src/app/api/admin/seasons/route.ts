import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour la création de saison
const createSeasonSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['LOW', 'MEDIUM', 'HIGH', 'PEAK']),
  startDate: z.string().datetime('Date de début invalide'),
  endDate: z.string().datetime('Date de fin invalide'),
  multiplier: z.number().min(0).default(1.0),
})

/**
 * Route API pour récupérer toutes les saisons
 * GET /api/admin/seasons
 */
export async function GET(request: NextRequest) {
  try {
    const seasons = await prisma.season.findMany({
      include: {
        pricingRules: true,
      },
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json(seasons, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des saisons:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des saisons' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour créer une nouvelle saison
 * POST /api/admin/seasons
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSeasonSchema.parse(body)

    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    // Vérifier que la date de fin est après la date de début
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      )
    }

    const season = await prisma.season.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        startDate,
        endDate,
        multiplier: validatedData.multiplier,
      },
      include: {
        pricingRules: true,
      },
    })

    return NextResponse.json(
      { message: 'Saison créée avec succès', season },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création de la saison:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la saison' },
      { status: 500 }
    )
  }
}
