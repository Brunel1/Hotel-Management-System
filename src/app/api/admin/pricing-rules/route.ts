import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour la création de règle de tarification
const createPricingRuleSchema = z.object({
  seasonId: z.string().min(1, 'L&apos;ID de la saison est requis'),
  roomType: z.enum(['STANDARD', 'SUPERIOR', 'SUITE', 'DELUXE', 'FAMILY']),
  multiplier: z.number().min(0).default(1.0),
  minOccupancy: z.number().int().min(0).optional(),
  maxOccupancy: z.number().int().min(0).optional(),
})

/**
 * Route API pour récupérer toutes les règles de tarification
 * GET /api/admin/pricing-rules
 */
export async function GET() {
  try {
    const pricingRules = await prisma.pricingRule.findMany({
      include: {
        season: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(pricingRules, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des règles de tarification:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des règles de tarification' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour créer une nouvelle règle de tarification
 * POST /api/admin/pricing-rules
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPricingRuleSchema.parse(body)

    // Vérifier que la saison existe
    const season = await prisma.season.findUnique({
      where: { id: validatedData.seasonId },
    })

    if (!season) {
      return NextResponse.json(
        { error: 'Saison non trouvée' },
        { status: 404 }
      )
    }

    const pricingRule = await prisma.pricingRule.create({
      data: {
        seasonId: validatedData.seasonId,
        roomType: validatedData.roomType,
        multiplier: validatedData.multiplier,
        minOccupancy: validatedData.minOccupancy,
        maxOccupancy: validatedData.maxOccupancy,
      },
      include: {
        season: true,
      },
    })

    return NextResponse.json(
      { message: 'Règle de tarification créée avec succès', pricingRule },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création de la règle de tarification:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la règle de tarification' },
      { status: 500 }
    )
  }
}
