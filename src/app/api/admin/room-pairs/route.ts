import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRoomPair, getRoomPairs, updateRoomPair, deleteRoomPair, isRoomPairAvailable, calculateRoomPairPrice } from '@/lib/room-pairs'
import { z } from 'zod'

// Schéma de validation pour la création d'une paire de chambres
const roomPairSchema = z.object({
  roomId1: z.string(),
  roomId2: z.string(),
  name: z.string(),
  description: z.string().optional(),
  discount: z.number().min(0).max(100).optional(),
})

/**
 * Route API pour créer une paire de chambres
 * POST /api/admin/room-pairs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = roomPairSchema.parse(body)

    // Vérifier que les chambres sont différentes
    if (validatedData.roomId1 === validatedData.roomId2) {
      return NextResponse.json(
        { error: 'Les chambres doivent être différentes' },
        { status: 400 }
      )
    }

    // Vérifier que les chambres existent
    const room1 = await prisma.room.findUnique({
      where: { id: validatedData.roomId1 },
    })

    const room2 = await prisma.room.findUnique({
      where: { id: validatedData.roomId2 },
    })

    if (!room1 || !room2) {
      return NextResponse.json(
        { error: 'Une ou les deux chambres n&apos;existent pas' },
        { status: 404 }
      )
    }

    // Créer la paire de chambres
    const roomPair = await createRoomPair(validatedData)

    return NextResponse.json(
      { message: 'Paire de chambres créée avec succès', roomPair },
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
    console.error('Erreur lors de la création de la paire de chambres:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la paire de chambres' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer toutes les paires de chambres
 * GET /api/admin/room-pairs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')

    const roomPairs = await getRoomPairs()

    // Si des dates sont fournies, vérifier la disponibilité
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)

      const roomPairsWithAvailability = await Promise.all(
        roomPairs.map(async (pair) => ({
          ...pair,
          available: await isRoomPairAvailable(pair.id, checkInDate, checkOutDate),
          price: await calculateRoomPairPrice(pair.id, checkInDate, checkOutDate),
        }))
      )

      return NextResponse.json(roomPairsWithAvailability, { status: 200 })
    }

    return NextResponse.json(roomPairs, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des paires de chambres:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des paires de chambres' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour une paire de chambres
 * PATCH /api/admin/room-pairs
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const roomPair = await updateRoomPair(id, data)

    return NextResponse.json(roomPair, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la paire de chambres:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la paire de chambres' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer une paire de chambres
 * DELETE /api/admin/room-pairs?id=
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    await deleteRoomPair(id)

    return NextResponse.json(
      { message: 'Paire de chambres supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de la paire de chambres:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la paire de chambres' },
      { status: 500 }
    )
  }
}
