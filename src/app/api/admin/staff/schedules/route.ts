import { NextRequest, NextResponse } from 'next/server'
import { createSchedule, getAllSchedules, updateSchedule, deleteSchedule } from '@/lib/staff'
import { z } from 'zod'

// Schéma de validation pour la création d'horaire
const scheduleSchema = z.object({
  userId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})

/**
 * Route API pour créer un horaire (admin)
 * POST /api/admin/staff/schedules
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = scheduleSchema.parse(body)

    // Créer l'horaire
    const schedule = await createSchedule({
      userId: validatedData.userId,
      date: new Date(validatedData.date),
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
    })

    return NextResponse.json(
      { message: 'Horaire créé avec succès', schedule },
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
    console.error('Erreur lors de la création de l&apos;horaire:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l&apos;horaire' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer tous les horaires (admin)
 * GET /api/admin/staff/schedules?date=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    const schedules = await getAllSchedules(date ? new Date(date) : undefined)

    return NextResponse.json(schedules, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des horaires' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour un horaire (admin)
 * PATCH /api/admin/staff/schedules
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

    const updateData: any = {}
    if (data.date) updateData.date = new Date(data.date)
    if (data.startTime) updateData.startTime = data.startTime
    if (data.endTime) updateData.endTime = data.endTime

    const schedule = await updateSchedule(id, updateData)

    return NextResponse.json(schedule, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l&apos;horaire:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l&apos;horaire' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer un horaire (admin)
 * DELETE /api/admin/staff/schedules?id=
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

    await deleteSchedule(id)

    return NextResponse.json(
      { message: 'Horaire supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de l&apos;horaire:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l&apos;horaire' },
      { status: 500 }
    )
  }
}
