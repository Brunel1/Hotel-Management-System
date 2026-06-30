import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour la gestion des tâches de maintenance
 * GET /api/maintenance-tasks - Récupérer toutes les tâches de maintenance
 * POST /api/maintenance-tasks - Créer une nouvelle tâche de maintenance
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
    const priority = searchParams.get('priority')
    const status = searchParams.get('status')

    const whereClause: any = {}
    if (priority) whereClause.priority = priority
    if (status) whereClause.status = status

    const tasks = await prisma.maintenanceTask.findMany({
      where: whereClause,
      include: {
        assignedUser: {
          include: {
            profile: true,
          },
        },
        room: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches de maintenance:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des tâches de maintenance' },
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
    const { title, description, priority, location, roomId } = body

    // Validation
    if (!title || !priority || !location) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Créer la tâche de maintenance
    const task = await prisma.maintenanceTask.create({
      data: {
        title,
        description: description || '',
        priority,
        location,
        status: 'PENDING',
        reportedBy: userId,
        roomId: roomId || null,
      },
    })

    return NextResponse.json(
      { message: 'Tâche de maintenance créée avec succès', task },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création de la tâche de maintenance:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la tâche de maintenance' },
      { status: 500 }
    )
  }
}
