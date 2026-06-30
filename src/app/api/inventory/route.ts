import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour la gestion de l'inventaire
 * GET /api/inventory - Récupérer tous les articles d'inventaire
 * POST /api/inventory - Créer un nouvel article
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
    const category = searchParams.get('category')

    const whereClause = category ? { category } : {}

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inventaire:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l\'inventaire' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions (seuls les admins peuvent créer des articles)
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, category, quantity, unit, minStock, supplier } = body

    // Validation
    if (!name || !category || !quantity || !unit) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Créer l'article
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        quantity,
        unit,
        minStock: minStock || 10,
        supplier: supplier || '',
        lastRestock: new Date(),
      },
    })

    return NextResponse.json(
      { message: 'Article créé avec succès', item },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'article' },
      { status: 500 }
    )
  }
}
