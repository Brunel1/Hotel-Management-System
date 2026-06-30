import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

/**
 * Route API pour mettre à jour les préférences utilisateur
 * PUT /api/user/preferences
 */
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Mettre à jour le profil avec les préférences
    const updatedProfile = await prisma.profile.update({
      where: { userId: payload.userId },
      data: {
        preferredRoomType: body.preferredRoomType,
        preferredFloor: body.preferredFloor,
        preferredView: body.preferredView,
        dietaryRestrictions: body.dietaryRestrictions,
        languagePreference: body.languagePreference,
        currencyPreference: body.currencyPreference,
        notificationPreferences: body.notificationPreferences,
        specialRequests: body.specialRequests,
        favoriteRoomIds: body.favoriteRoomIds,
        bedType: body.bedType,
        smokingPreference: body.smokingPreference,
      },
    })

    return NextResponse.json({
      message: 'Préférences mises à jour avec succès',
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour des préférences' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les préférences utilisateur
 * GET /api/user/preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    // Récupérer le profil avec les préférences
    const profile = await prisma.profile.findUnique({
      where: { userId: payload.userId },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      preferredRoomType: profile.preferredRoomType,
      preferredFloor: profile.preferredFloor,
      preferredView: profile.preferredView,
      dietaryRestrictions: profile.dietaryRestrictions,
      languagePreference: profile.languagePreference,
      currencyPreference: profile.currencyPreference,
      notificationPreferences: profile.notificationPreferences,
      specialRequests: profile.specialRequests,
      favoriteRoomIds: profile.favoriteRoomIds,
      bedType: profile.bedType,
      smokingPreference: profile.smokingPreference,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des préférences' },
      { status: 500 }
    )
  }
}
