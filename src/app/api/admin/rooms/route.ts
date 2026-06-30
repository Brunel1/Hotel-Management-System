import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, RoomType } from '@prisma/client'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Récupérer toutes les chambres avec équipements
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

    // Vérifier que l'utilisateur est admin
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const rooms = await prisma.room.findMany({
      orderBy: { number: 'asc' },
      include: {
        amenities: {
          include: {
            amenity: true
          }
        }
      }
    })
    
    // Transformer les données pour le frontend
    const transformedRooms = rooms.map(room => ({
      id: room.id,
      number: room.number,
      type: room.type.toLowerCase(),
      pricePerNight: parseFloat(room.pricePerNight.toString()),
      capacity: room.capacity,
      description: room.description,
      amenities: room.amenities.map(ra => ra.amenity.name),
      images: room.images ? JSON.parse(room.images) : [],
      available: room.isActive,
      floor: room.floor || 1,
      size: 20 // Valeur par défaut si non dans le schéma
    }))
    
    return NextResponse.json(transformedRooms)
  } catch (error) {
    console.error('Erreur lors de la récupération des chambres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chambres' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle chambre
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

    // Vérifier que l'utilisateur est admin
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Créer ou récupérer les équipements
    const amenityPromises = (body.amenities || []).map(async (amenityName: string) => {
      let amenity = await prisma.amenity.findUnique({
        where: { name: amenityName }
      })
      
      if (!amenity) {
        amenity = await prisma.amenity.create({
          data: { name: amenityName }
        })
      }
      
      return amenity
    })
    
    const amenities = await Promise.all(amenityPromises)
    
    const room = await prisma.room.create({
      data: {
        number: body.number,
        type: body.type.toUpperCase() as RoomType,
        pricePerNight: body.pricePerNight,
        capacity: body.capacity,
        description: body.description,
        images: JSON.stringify(body.images || []),
        isActive: body.available ?? true,
        floor: body.floor
      }
    })
    
    // Associer les équipements
    for (const amenity of amenities) {
      await prisma.roomAmenity.create({
        data: {
          roomId: room.id,
          amenityId: amenity.id
        }
      })
    }
    
    return NextResponse.json({ success: true, id: room.id }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la chambre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la chambre' },
      { status: 500 }
    )
  }
}
