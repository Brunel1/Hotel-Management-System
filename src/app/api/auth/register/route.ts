import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
})

/**
 * Route API pour l'inscription d'un nouvel utilisateur
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    // Parser le corps de la requête
    const body = await request.json()

    // Valider les données
    const validatedData = registerSchema.parse(body)

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password)

    // Créer l'utilisateur et son profil dans une transaction
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        twoFactorBackupCodes: '', // Codes de secours vides par défaut (2FA non activé)
        profile: {
          create: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
            address: validatedData.address,
            city: validatedData.city,
            country: validatedData.country,
            postalCode: validatedData.postalCode,
            allergies: '', // Allergies vides par défaut
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'VISITOR', // Utiliser VISITOR par défaut si pas de rôle
    })

    // Retourner la réponse avec le token et les données utilisateur (sans le mot de passe)
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
        message: 'Inscription réussie',
        token,
        user: userWithoutPassword,
      },
      { status: 201 }
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
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    )
  }
}
