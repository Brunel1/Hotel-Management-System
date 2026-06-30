import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * Route API pour la demande de réinitialisation de mot de passe
 * POST /api/auth/forgot-password
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Adresse email requise' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Même si l'utilisateur n'existe pas, on retourne un succès pour éviter
    // de révéler l'existence des comptes
    if (!user) {
      return NextResponse.json(
        { message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé' },
        { status: 200 }
      )
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Stocker le token dans la base de données (utiliser un champ existant ou créer une migration)
    // Pour l'instant, nous allons simuler l'envoi d'email
    console.log(`Token de réinitialisation pour ${email}: ${resetToken}`)
    console.log(`Expiration: ${resetTokenExpiry}`)

    // TODO: Envoyer un email avec le lien de réinitialisation
    // const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
    // await sendPasswordResetEmail(email, resetLink)

    return NextResponse.json(
      { message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la demande de réinitialisation' },
      { status: 500 }
    )
  }
}
