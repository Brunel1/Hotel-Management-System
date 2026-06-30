import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    // Récupérer les articles d'inventaire (simulés pour l'instant)
    const items = [
      {
        id: '1',
        name: 'Serviettes',
        category: 'linge',
        quantity: 150,
        minStock: 50,
        unit: 'pièces',
        status: 'in_stock',
        lastRestocked: '2024-06-01',
      },
      {
        id: '2',
        name: 'Savons',
        category: 'toiletterie',
        quantity: 30,
        minStock: 100,
        unit: 'unités',
        status: 'low_stock',
        lastRestocked: '2024-05-15',
      },
      {
        id: '3',
        name: 'Bouteilles d\'eau',
        category: 'boissons',
        quantity: 200,
        minStock: 80,
        unit: 'bouteilles',
        status: 'in_stock',
        lastRestocked: '2024-06-10',
      },
    ]

    const filteredItems = items.filter((item) => {
      if (category && item.category !== category) return false
      if (status && item.status !== status) return false
      return true
    })

    const lowStockItems = items.filter((item) => item.status === 'low_stock')

    return NextResponse.json({
      items: filteredItems,
      stats: {
        total: items.length,
        lowStock: lowStockItems.length,
        outOfStock: items.filter((i) => i.status === 'out_of_stock').length,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inventaire:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, quantity, minStock, unit } = body

    const newItem = {
      id: Date.now().toString(),
      name,
      category,
      quantity,
      minStock,
      unit,
      status: quantity > minStock ? 'in_stock' : quantity === 0 ? 'out_of_stock' : 'low_stock',
      lastRestocked: new Date().toISOString().split('T')[0],
    }

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { id, quantity } = body

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
