import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'
import { generateTwoFactorSecret, enableTwoFactor, disableTwoFactor, verifyTwoFactorToken, isTwoFactorEnabled } from '@/lib/two-factor'

/**
 * Route API pour générer un secret 2FA
 * POST /api/auth/2fa/generate
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()
    const action = body.action

    if (action === 'generate') {
      const { secret, qrCode } = await generateTwoFactorSecret(userId)
      return NextResponse.json({ secret, qrCode }, { status: 200 })
    }

    if (action === 'enable') {
      const { token } = body
      if (!token) {
        return NextResponse.json({ error: 'Token requis' }, { status: 400 })
      }

      const result = await enableTwoFactor(userId, token)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    if (action === 'disable') {
      await disableTwoFactor(userId)
      return NextResponse.json({ message: '2FA désactivée avec succès' }, { status: 200 })
    }

    if (action === 'verify') {
      const { token } = body
      if (!token) {
        return NextResponse.json({ error: 'Token requis' }, { status: 400 })
      }

      const verified = await verifyTwoFactorToken(userId, token)
      return NextResponse.json({ verified }, { status: 200 })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (error) {
    console.error('Erreur lors de la gestion de la 2FA:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la gestion de la 2FA' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour vérifier si la 2FA est activée
 * GET /api/auth/2fa
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const enabled = await isTwoFactorEnabled(userId)
    return NextResponse.json({ enabled }, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la vérification de la 2FA:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification de la 2FA' },
      { status: 500 }
    )
  }
}
