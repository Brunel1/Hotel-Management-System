import { NextRequest, NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, code, secret } = await request.json()

    if (!userId || !code || !secret) {
      return NextResponse.json(
        { error: 'userId, code et secret requis' },
        { status: 400 }
      )
    }

    // Vérifier le code TOTP
    const isValid = authenticator.verify({
      token: code,
      secret: secret
    })

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Code invalide' },
        { status: 400 }
      )
    }

    // Sauvegarder le secret 2FA dans la base de données
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la vérification 2FA:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
