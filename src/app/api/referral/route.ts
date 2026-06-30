import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { getUserReferralCode, useReferralCode, getReferralStats, deactivateReferralCode } from '@/lib/referral'
import { z } from 'zod'

/**
 * Route API pour récupérer le code de parrainage de l'utilisateur
 * GET /api/referral
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const referral = await getUserReferralCode(userId)

    return NextResponse.json(referral, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération du code de parrainage:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du code de parrainage' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour utiliser un code de parrainage
 * POST /api/referral/use
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    const { code, referrerId } = body

    if (!code || !referrerId) {
      return NextResponse.json(
        { error: 'Code et referrerId requis' },
        { status: 400 }
      )
    }

    const referralUse = await useReferralCode(referrerId, userId)

    return NextResponse.json(
      { message: 'Code de parrainage utilisé avec succès', referralUse },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de l&apos;utilisation du code de parrainage:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l&apos;utilisation du code de parrainage' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les statistiques de parrainage
 * GET /api/referral/stats
 */
export async function GET_STATS(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const stats = await getReferralStats(userId)

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour désactiver le code de parrainage
 * DELETE /api/referral
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const referral = await deactivateReferralCode(userId)

    return NextResponse.json(referral, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la désactivation du code de parrainage:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la désactivation du code de parrainage' },
      { status: 500 }
    )
  }
}
