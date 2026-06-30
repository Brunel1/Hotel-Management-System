import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour la création de politique d'annulation
const createCancellationPolicySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  hoursBeforeCheckIn: z.number().int().min(0).default(24),
  penaltyPercentage: z.number().min(0).max(1).default(0.1),
})

/**
 * Route API pour récupérer toutes les politiques d'annulation
 * GET /api/admin/cancellation-policies
 */
export async function GET() {
  try {
    const policies = await prisma.cancellationPolicy.findMany({
      orderBy: { hoursBeforeCheckIn: 'asc' },
    })

    return NextResponse.json(policies, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des politiques d&apos;annulation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des politiques d&apos;annulation' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour créer une nouvelle politique d'annulation
 * POST /api/admin/cancellation-policies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCancellationPolicySchema.parse(body)

    const policy = await prisma.cancellationPolicy.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        hoursBeforeCheckIn: validatedData.hoursBeforeCheckIn,
        penaltyPercentage: validatedData.penaltyPercentage,
      },
    })

    return NextResponse.json(
      { message: 'Politique d&apos;annulation créée avec succès', policy },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création de la politique d&apos;annulation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la politique d&apos;annulation' },
      { status: 500 }
    )
  }
}
