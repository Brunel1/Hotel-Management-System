import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Route API pour récupérer les disponibilités d'une chambre
 * GET /api/rooms/[id]/availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Récupérer les réservations confirmées pour cette chambre
    const bookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
        },
        ...(startDate && endDate ? {
          OR: [
            {
              checkIn: {
                lte: new Date(endDate),
              },
              checkOut: {
                gte: new Date(startDate),
              },
            },
          ],
        } : {}),
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    })

    // Générer la liste des dates indisponibles
    const unavailableDates: string[] = []
    
    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      
      const currentDate = new Date(checkIn)
      while (currentDate < checkOut) {
        unavailableDates.push(currentDate.toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    return NextResponse.json({
      unavailableDates,
      bookings: bookings.length,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des disponibilités' },
      { status: 500 }
    )
  }
}
