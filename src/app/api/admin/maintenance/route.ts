import { NextRequest, NextResponse } from 'next/server'
import { createMaintenanceTask, getMaintenanceTasks, updateMaintenanceTask, deleteMaintenanceTask } from '@/lib/maintenance'
import { z } from 'zod'

// Schéma de validation pour la création de tâche de maintenance
const maintenanceTaskSchema = z.object({
  roomId: z.string(),
  type: z.string(),
  description: z.string(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
})

/**
 * Route API pour créer une tâche de maintenance (admin)
 * POST /api/admin/maintenance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = maintenanceTaskSchema.parse(body)

    // Créer la tâche
    const task = await createMaintenanceTask({
      roomId: validatedData.roomId,
      type: validatedData.type,
      description: validatedData.description,
      priority: validatedData.priority,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      assignedToId: validatedData.assignedToId,
    })

    return NextResponse.json(
      { message: 'Tâche de maintenance créée avec succès', task },
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
    console.error('Erreur lors de la création de la tâche de maintenance:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la tâche de maintenance' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les tâches de maintenance (admin)
 * GET /api/admin/maintenance?roomId=&status=&type=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const filters: any = {}
    if (roomId) filters.roomId = roomId
    if (status) filters.status = status
    if (type) filters.type = type

    const tasks = await getMaintenanceTasks(filters)

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches de maintenance:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des tâches de maintenance' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour une tâche de maintenance (admin)
 * PATCH /api/admin/maintenance
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
    if (data.type) updateData.type = data.type
    if (data.description) updateData.description = data.description
    if (data.priority) updateData.priority = data.priority
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate)
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId
    if (data.status) updateData.status = data.status

    const task = await updateMaintenanceTask(id, updateData)

    return NextResponse.json(task, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche de maintenance:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la tâche de maintenance' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer une tâche de maintenance (admin)
 * DELETE /api/admin/maintenance?id=
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

    await deleteMaintenanceTask(id)

    return NextResponse.json(
      { message: 'Tâche de maintenance supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche de maintenance:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la tâche de maintenance' },
      { status: 500 }
    )
  }
}
