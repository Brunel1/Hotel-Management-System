import { NextRequest, NextResponse } from 'next/server'
import { createProduct, getProducts, updateProduct, deleteProduct, adjustStock } from '@/lib/inventory'
import { z } from 'zod'

// Schéma de validation pour la création de produit
const productSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number(),
  minStock: z.number(),
})

/**
 * Route API pour créer un produit (admin)
 * POST /api/admin/inventory/products
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = productSchema.parse(body)

    // Créer le produit
    const product = await createProduct(validatedData)

    return NextResponse.json(
      { message: 'Produit créé avec succès', product },
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
    console.error('Erreur lors de la création du produit:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du produit' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les produits (admin)
 * GET /api/admin/inventory/products?category=&lowStock=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const lowStock = searchParams.get('lowStock') === 'true'

    const filters: any = {}
    if (category) filters.category = category
    if (lowStock) filters.lowStock = true

    const products = await getProducts(filters)

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour un produit (admin)
 * PATCH /api/admin/inventory/products
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
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.minStock !== undefined) updateData.minStock = data.minStock

    const product = await updateProduct(id, updateData)

    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du produit' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer un produit (admin)
 * DELETE /api/admin/inventory/products?id=
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

    await deleteProduct(id)

    return NextResponse.json(
      { message: 'Produit supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du produit' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour ajuster le stock d'un produit (admin)
 * POST /api/admin/inventory/products/adjust
 */
export async function POST_ADJUST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, reason } = body

    if (!productId || quantity === undefined || !reason) {
      return NextResponse.json(
        { error: 'productId, quantity et reason requis' },
        { status: 400 }
      )
    }

    const product = await adjustStock(productId, quantity, reason)

    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de l&apos;ajustement du stock:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue lors de l&apos;ajustement du stock' },
      { status: 500 }
    )
  }
}
