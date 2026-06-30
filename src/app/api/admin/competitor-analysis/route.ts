import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Données simulées des concurrents (à remplacer par une vraie source de données)
    const competitors = [
      {
        id: '1',
        name: 'Hôtel Plaza',
        price: 120,
        occupancy: 85,
        rating: 4.2,
        advantages: ['Emplacement central', 'Piscine'],
        disadvantages: ['Service lent', 'Petit-déjeuner cher'],
      },
      {
        id: '2',
        name: 'Résidence Mahajanga',
        price: 95,
        occupancy: 72,
        rating: 3.8,
        advantages: ['Prix abordable', 'Parking gratuit'],
        disadvantages: ['Chambres basiques', 'WiFi lent'],
      },
      {
        id: '3',
        name: 'Grand Hôtel',
        price: 150,
        occupancy: 90,
        rating: 4.5,
        advantages: ['Luxe', 'Service impeccable'],
        disadvantages: ['Très cher', 'Formel'],
      },
    ]

    // Récupérer nos propres données
    const ourRooms = await prisma.room.findMany()
    const ourBookings = await prisma.booking.count({
      where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
    })
    const ourOccupancy = ourRooms.length > 0 ? Math.round((ourBookings / ourRooms.length) * 100) : 0
    const ourAvgPrice = ourRooms.length > 0 ? Math.round(Number(ourRooms.reduce((sum, room) => sum + Number(room.pricePerNight), 0) / ourRooms.length)) : 0

    return NextResponse.json({
      ourData: {
        name: 'Notre Hôtel',
        price: ourAvgPrice,
        occupancy: ourOccupancy,
        rating: 4.0,
      },
      competitors,
    })
  } catch (error) {
    console.error('Erreur lors de l\'analyse des concurrents:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
