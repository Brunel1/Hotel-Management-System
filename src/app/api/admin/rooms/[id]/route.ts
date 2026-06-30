import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, RoomType } from '@prisma/client'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

const prisma = new PrismaClient()

// PUT - Modifier une chambre
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const id = params.id
    
    // Gérer les équipements si fournis
    if (body.amenities !== undefined) {
      // Supprimer les anciens équipements
      await prisma.roomAmenity.deleteMany({
        where: { roomId: id }
      })
      
      // Créer ou récupérer les nouveaux équipements
      const amenityPromises = body.amenities.map(async (amenityName: string) => {
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
      
      // Associer les nouveaux équipements
      for (const amenity of amenities) {
        await prisma.roomAmenity.create({
          data: {
            roomId: id,
            amenityId: amenity.id
          }
        })
      }
    }
    
    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(body.number && { number: body.number }),
        ...(body.type && { type: body.type.toUpperCase() as RoomType }),
        ...(body.pricePerNight !== undefined && { pricePerNight: body.pricePerNight }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.images !== undefined && { images: JSON.stringify(body.images) }),
        ...(body.available !== undefined && { isActive: body.available }),
        ...(body.floor !== undefined && { floor: body.floor })
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la modification de la chambre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la chambre' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une chambre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = params.id
    
    // Supprimer d'abord les relations d'équipements
    await prisma.roomAmenity.deleteMany({
      where: { roomId: id }
    })
    
    await prisma.room.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de la chambre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la chambre' },
      { status: 500 }
    )
  }
}
