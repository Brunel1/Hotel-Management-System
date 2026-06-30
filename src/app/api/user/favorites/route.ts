import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

/**
 * Route API pour ajouter une chambre aux favoris
 * POST /api/user/favorites
 */
export async function POST(request: NextRequest) {
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
    const { roomId } = body

    // Récupérer le profil utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: payload.userId },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les favoris actuels
    const currentFavorites = profile.favoriteRoomIds ? JSON.parse(profile.favoriteRoomIds) : []
    
    // Ajouter la chambre aux favoris si elle n'y est pas déjà
    if (!currentFavorites.includes(roomId)) {
      currentFavorites.push(roomId)
      
      // Mettre à jour le profil
      await prisma.profile.update({
        where: { userId: payload.userId },
        data: {
          favoriteRoomIds: JSON.stringify(currentFavorites),
        },
      })
    }

    return NextResponse.json({
      message: 'Chambre ajoutée aux favoris',
      favorites: currentFavorites,
    })
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'ajout aux favoris' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer une chambre des favoris
 * DELETE /api/user/favorites
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'ID de chambre requis' },
        { status: 400 }
      )
    }

    // Récupérer le profil utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: payload.userId },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les favoris actuels
    const currentFavorites = profile.favoriteRoomIds ? JSON.parse(profile.favoriteRoomIds) : []
    
    // Supprimer la chambre des favoris
    const updatedFavorites = currentFavorites.filter((id: string) => id !== roomId)
    
    // Mettre à jour le profil
    await prisma.profile.update({
      where: { userId: payload.userId },
      data: {
        favoriteRoomIds: JSON.stringify(updatedFavorites),
      },
    })

    return NextResponse.json({
      message: 'Chambre supprimée des favoris',
      favorites: updatedFavorites,
    })
  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression des favoris' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les chambres favorites
 * GET /api/user/favorites
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

    // Récupérer le profil utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: payload.userId },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les favoris
    const favoriteRoomIds = profile.favoriteRoomIds ? JSON.parse(profile.favoriteRoomIds) : []
    
    // Récupérer les détails des chambres favorites
    const favoriteRooms = await prisma.room.findMany({
      where: {
        id: { in: favoriteRoomIds },
        isActive: true,
      },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    })

    return NextResponse.json({
      favorites: favoriteRooms,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des favoris' },
      { status: 500 }
    )
  }
}
