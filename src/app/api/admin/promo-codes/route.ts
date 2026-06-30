import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createPromoCode, getAllPromoCodes, deactivatePromoCode, validatePromoCode } from '@/lib/promo-codes'

// Schéma de validation pour la création de code de réduction
const createPromoCodeSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0),
  minAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  validFrom: z.string().datetime('Date de début invalide'),
  validUntil: z.string().datetime('Date de fin invalide'),
  maxUses: z.number().int().min(0).optional(),
})

/**
 * Route API pour récupérer tous les codes de réduction
 * GET /api/admin/promo-codes
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const amount = searchParams.get('amount')

    if (code && amount) {
      // Valider un code de réduction
      const validation = await validatePromoCode(code, parseFloat(amount))
      return NextResponse.json(validation, { status: 200 })
    }

    const promoCodes = await getAllPromoCodes()
    return NextResponse.json(promoCodes, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des codes de réduction:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des codes de réduction' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour créer un nouveau code de réduction
 * POST /api/admin/promo-codes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPromoCodeSchema.parse(body)

    const validFrom = new Date(validatedData.validFrom)
    const validUntil = new Date(validatedData.validUntil)

    if (validUntil <= validFrom) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      )
    }

    const promoCode = await createPromoCode({
      code: validatedData.code,
      description: validatedData.description,
      discountType: validatedData.discountType,
      discountValue: validatedData.discountValue,
      minAmount: validatedData.minAmount,
      maxDiscount: validatedData.maxDiscount,
      validFrom,
      validUntil,
      maxUses: validatedData.maxUses,
    })

    return NextResponse.json(
      { message: 'Code de réduction créé avec succès', promoCode },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création du code de réduction:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du code de réduction' },
      { status: 500 }
    )
  }
}
