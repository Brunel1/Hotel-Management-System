import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour la gestion des shifts
 * GET /api/shifts - Récupérer tous les shifts
 * POST /api/shifts - Créer un nouveau shift
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    const whereClause = employeeId ? { employeeId } : {}

    const shifts = await prisma.schedule.findMany({
      where: whereClause,
      include: {
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

    // Transformer les données pour correspondre à l'interface
    const transformedShifts = shifts.map(shift => ({
      id: shift.id,
      employeeId: shift.userId,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      type: shift.shiftType as 'MORNING' | 'AFTERNOON' | 'NIGHT',
    }))

    return NextResponse.json(transformedShifts, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des shifts:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des shifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions (seuls les admins peuvent créer des shifts)
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { employeeId, date, startTime, endTime, type } = body

    // Validation
    if (!employeeId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Créer le shift
    const shift = await prisma.schedule.create({
      data: {
        userId: employeeId,
        date: new Date(date),
        startTime,
        endTime,
        shiftType: type || 'MORNING',
      },
    })

    return NextResponse.json(
      { message: 'Shift créé avec succès', shift },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création du shift:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du shift' },
      { status: 500 }
    )
  }
}
