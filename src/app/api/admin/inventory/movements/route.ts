import { NextRequest, NextResponse } from 'next/server'
import { getStockMovements, getLowStockAlerts } from '@/lib/inventory'

/**
 * Route API pour récupérer les mouvements de stock (admin)
 * GET /api/admin/inventory/movements?productId=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')
    const alerts = searchParams.get('alerts') === 'true'

    if (alerts) {
      const products = await getLowStockAlerts()
      return NextResponse.json(products, { status: 200 })
    }

    const movements = await getStockMovements(productId || undefined)

    return NextResponse.json(movements, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des mouvements de stock:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des mouvements de stock' },
      { status: 500 }
    )
  }
}
