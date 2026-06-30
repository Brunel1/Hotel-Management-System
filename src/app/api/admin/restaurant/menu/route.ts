import { NextRequest, NextResponse } from 'next/server'
import { createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem } from '@/lib/restaurant'
import { z } from 'zod'

// Schéma de validation pour la création d'élément de menu
const menuItemSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string().optional(),
  price: z.number(),
  available: z.boolean(),
})

/**
 * Route API pour créer un élément de menu (admin)
 * POST /api/admin/restaurant/menu
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = menuItemSchema.parse(body)

    // Créer l'élément de menu
    const menuItem = await createMenuItem(validatedData)

    return NextResponse.json(
      { message: 'Élément de menu créé avec succès', menuItem },
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
    console.error('Erreur lors de la création de l&apos;élément de menu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l&apos;élément de menu' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les éléments de menu (admin)
 * GET /api/admin/restaurant/menu?category=&available=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const available = searchParams.get('available')

    const filters: any = {}
    if (category) filters.category = category
    if (available !== null) filters.available = available === 'true'

    const menuItems = await getMenuItems(filters)

    return NextResponse.json(menuItems, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments de menu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des éléments de menu' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour un élément de menu (admin)
 * PATCH /api/admin/restaurant/menu
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
    if (data.category) updateData.category = data.category
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = data.price
    if (data.available !== undefined) updateData.available = data.available

    const menuItem = await updateMenuItem(id, updateData)

    return NextResponse.json(menuItem, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l&apos;élément de menu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l&apos;élément de menu' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer un élément de menu (admin)
 * DELETE /api/admin/restaurant/menu?id=
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

    await deleteMenuItem(id)

    return NextResponse.json(
      { message: 'Élément de menu supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de l&apos;élément de menu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l&apos;élément de menu' },
      { status: 500 }
    )
  }
}
