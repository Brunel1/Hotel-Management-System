import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour la gestion des services
 * GET /api/services - Récupérer tous les services
 * POST /api/services - Créer un nouveau service
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
    const type = searchParams.get('type')

    const whereClause = type ? { type: type as any } : {}

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(services, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions (seuls les admins peuvent créer des services)
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, type, description, price, duration, availability, image } = body

    // Validation
    if (!name || !type || !price) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Créer le service
    const service = await prisma.service.create({
      data: {
        name,
        type,
        description: description || '',
        price,
        duration,
        availability: availability ?? true,
        image: image || '',
      },
    })

    return NextResponse.json(
      { message: 'Service créé avec succès', service },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création du service:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du service' },
      { status: 500 }
    )
  }
}
