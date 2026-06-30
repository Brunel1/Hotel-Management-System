import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les données de yield management
    const rooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          },
        },
      },
    })

    const yieldData = rooms.map((room) => {
      const currentPrice = room.pricePerNight
      const occupancyRate = room.bookings.length > 0 ? 1 : 0
      const demandLevel = occupancyRate > 0.7 ? 'high' : occupancyRate > 0.4 ? 'medium' : 'low'
      
      // Calcul du prix suggéré basé sur la demande
      let suggestedPrice = currentPrice
      if (demandLevel === 'high') {
        suggestedPrice = Math.round(currentPrice * 1.2)
      } else if (demandLevel === 'medium') {
        suggestedPrice = Math.round(currentPrice * 1.1)
      }

      return {
        roomId: room.id,
        roomNumber: room.number,
        roomType: room.type,
        currentPrice,
        occupancyRate: Math.round(occupancyRate * 100),
        demandLevel,
        suggestedPrice,
      }
    })

    return NextResponse.json(yieldData)
  } catch (error) {
    console.error('Erreur lors de la récupération des données yield management:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { roomId, newPrice } = body

    await prisma.room.update({
      where: { id: roomId },
      data: { pricePerNight: newPrice },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prix:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
