import { NextRequest, NextResponse } from 'next/server'
import { createTask, getAllTasks, updateTask, deleteTask } from '@/lib/staff'
import { z } from 'zod'

// Schéma de validation pour la création de tâche
const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  assignedToId: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().optional(),
})

/**
 * Route API pour créer une tâche (admin)
 * POST /api/admin/staff/tasks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = taskSchema.parse(body)

    // Créer la tâche
    const task = await createTask({
      title: validatedData.title,
      description: validatedData.description,
      assignedToId: validatedData.assignedToId,
      priority: validatedData.priority,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      status: validatedData.status,
    })

    return NextResponse.json(
      { message: 'Tâche créée avec succès', task },
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
    console.error('Erreur lors de la création de la tâche:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la tâche' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer toutes les tâches (admin)
 * GET /api/admin/staff/tasks?status=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const tasks = await getAllTasks(status || undefined)

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des tâches' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour une tâche (admin)
 * PATCH /api/admin/staff/tasks
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
    if (data.title) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId
    if (data.priority) updateData.priority = data.priority
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate)
    if (data.status) updateData.status = data.status

    const task = await updateTask(id, updateData)

    return NextResponse.json(task, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la tâche' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer une tâche (admin)
 * DELETE /api/admin/staff/tasks?id=
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

    await deleteTask(id)

    return NextResponse.json(
      { message: 'Tâche supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la tâche' },
      { status: 500 }
    )
  }
}
