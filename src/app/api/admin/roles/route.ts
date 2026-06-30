import { NextRequest, NextResponse } from 'next/server'
import { createRole, getRoles, updateRole, deleteRole, assignRoleToUser } from '@/lib/roles'
import { z } from 'zod'

// Schéma de validation pour la création de rôle
const roleSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
})

/**
 * Route API pour créer un rôle (admin)
 * POST /api/admin/roles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = roleSchema.parse(body)

    // Créer le rôle
    const role = await createRole(validatedData)

    return NextResponse.json(
      { message: 'Rôle créé avec succès', role },
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
    console.error('Erreur lors de la création du rôle:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du rôle' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer tous les rôles (admin)
 * GET /api/admin/roles
 */
export async function GET() {
  try {
    const roles = await getRoles()

    return NextResponse.json(roles, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des rôles' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour un rôle (admin)
 * PATCH /api/admin/roles
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
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.permissions) updateData.permissions = data.permissions

    const role = await updateRole(id, updateData)

    return NextResponse.json(role, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du rôle' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer un rôle (admin)
 * DELETE /api/admin/roles?id=
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

    await deleteRole(id)

    return NextResponse.json(
      { message: 'Rôle supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression du rôle:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du rôle' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour assigner un rôle à un utilisateur (admin)
 * POST /api/admin/roles/assign
 */
export async function POST_ASSIGN(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, roleId } = body

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'userId et roleId requis' },
        { status: 400 }
      )
    }

    const user = await assignRoleToUser(userId, roleId)

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de l&apos;assignation du rôle:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l&apos;assignation du rôle' },
      { status: 500 }
    )
  }
}
