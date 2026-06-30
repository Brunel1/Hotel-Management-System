import { NextRequest, NextResponse } from 'next/server'
import { authenticator } from 'otplib'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      )
    }

    // Générer un secret TOTP
    const secret = authenticator.generateSecret()
    const issuer = 'Gestion Hôtel'
    const label = `Hotel User (${userId})`
    const otpauthUrl = authenticator.keyuri(userId, issuer, secret)

    // Générer le QR code (utiliser une librairie comme qrcode)
    // Pour l'instant, on retourne l'URL OTPAUTH qui peut être convertie en QR code côté client
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`

    return NextResponse.json({
      secret,
      qrCode: qrCodeUrl,
      otpauthUrl
    })
  } catch (error) {
    console.error('Erreur lors de la configuration 2FA:', error)
    return NextResponse.json(
      { error: 'Impossible de configurer la 2FA' },
      { status: 500 }
    )
  }
}
