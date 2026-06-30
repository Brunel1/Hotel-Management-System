import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { verifyTwoFactorToken } from '@/lib/two-factor'
import { z } from 'zod'

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  twoFactorToken: z.string().optional(),
})

/**
 * Route API pour la connexion d'un utilisateur
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    // Parser le corps de la requête
    const body = await request.json()

    // Valider les données
    const validatedData = loginSchema.parse(body)

    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        profile: true,
      },
    })

    // Vérifier si l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Ce compte a été désactivé' },
        { status: 403 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier la 2FA si activée
    if (user.twoFactorEnabled) {
      if (!validatedData.twoFactorToken) {
        return NextResponse.json(
          { error: 'Token 2FA requis', requiresTwoFactor: true },
          { status: 401 }
        )
      }

      const isTwoFactorValid = await verifyTwoFactorToken(user.id, validatedData.twoFactorToken)
      if (!isTwoFactorValid) {
        return NextResponse.json(
          { error: 'Token 2FA invalide' },
          { status: 401 }
        )
      }
    }

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'VISITOR', // Utiliser VISITOR par défaut si pas de rôle
    })

    // Créer l'objet utilisateur sans le mot de passe
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
    }

    return NextResponse.json(
      {
        message: 'Connexion réussie',
        token,
        user: userWithoutPassword,
      },
      { status: 200 }
    )
  } catch (error) {
    // Gérer les erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    // Gérer les autres erreurs
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    )
  }
}
