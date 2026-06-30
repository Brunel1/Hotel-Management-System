import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Route API pour récupérer les disponibilités des chambres
 * GET /api/admin/availability?startDate=&endDate=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Récupérer toutes les chambres
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' },
    })

    // Récupérer toutes les réservations pour la période
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'] },
        OR: [
          {
            checkIn: { lte: end },
            checkOut: { gte: start },
          },
        ],
      },
      include: {
        room: true,
      },
    })

    // Créer un calendrier de disponibilité par chambre et par date
    const availability: Record<string, Record<string, boolean>> = {}

    // Initialiser le calendrier avec toutes les dates disponibles
    rooms.forEach((room) => {
      availability[room.id] = {}
      const currentDate = new Date(start)
      while (currentDate <= end) {
        const dateKey = currentDate.toISOString().split('T')[0]
        availability[room.id][dateKey] = true // Disponible par défaut
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    // Marquer les dates réservées comme indisponibles
    bookings.forEach((booking) => {
      const roomId = booking.roomId
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)

      const currentDate = new Date(checkIn)
      while (currentDate < checkOut) {
        const dateKey = currentDate.toISOString().split('T')[0]
        if (availability[roomId] && availability[roomId][dateKey] !== undefined) {
          availability[roomId][dateKey] = false // Indisponible
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    return NextResponse.json(
      {
        rooms,
        availability,
        bookings,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des disponibilités' },
      { status: 500 }
    )
  }
}
