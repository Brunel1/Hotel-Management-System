import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour la gestion des réservations de services
 * GET /api/service-bookings - Récupérer toutes les réservations de services
 * POST /api/service-bookings - Créer une nouvelle réservation de service
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR' && userRole !== 'STAFF') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    const whereClause = serviceId ? { serviceId } : {}

    const bookings = await prisma.serviceBooking.findMany({
      where: whereClause,
      include: {
        service: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(bookings, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations de services:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des réservations de services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (!userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { serviceId, date, time } = body

    // Validation
    if (!serviceId || !date || !time) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Créer la réservation
    const booking = await prisma.serviceBooking.create({
      data: {
        serviceId,
        userId,
        date: new Date(date),
        time,
        status: 'PENDING',
      },
    })

    return NextResponse.json(
      { message: 'Réservation créée avec succès', booking },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création de la réservation de service:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la réservation de service' },
      { status: 500 }
    )
  }
}
