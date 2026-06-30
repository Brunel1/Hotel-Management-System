import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des stocks (produits d'accueil, minibar)
 */

/**
 * Créer un produit
 */
export async function createProduct(data: {
  name: string
  category: string
  description?: string
  price: number
  stock: number
  minStock: number
}) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      stock: data.stock,
      minStock: data.minStock,
    },
  })

  return product
}

/**
 * Récupérer tous les produits
 */
export async function getProducts(filters?: {
  category?: string
  lowStock?: boolean
}) {
  const where: any = {}

  if (filters?.category) {
    where.category = filters.category
  }
  if (filters?.lowStock) {
    where.stock = {
      lte: prisma.product.fields.minStock,
    }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: 'asc' },
  })

  return products
}

/**
 * Mettre à jour un produit
 */
export async function updateProduct(productId: string, data: {
  name?: string
  category?: string
  description?: string
  price?: number
  stock?: number
  minStock?: number
}) {
  const product = await prisma.product.update({
    where: { id: productId },
    data,
  })

  return product
}

/**
 * Supprimer un produit
 */
export async function deleteProduct(productId: string) {
  await prisma.product.delete({
    where: { id: productId },
  })
}

/**
 * Ajuster le stock d'un produit
 */
export async function adjustStock(productId: string, quantity: number, reason: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error('Produit non trouvé')
  }

  const newStock = product.stock + quantity

  if (newStock < 0) {
    throw new Error('Stock insuffisant')
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: { stock: newStock },
  })

  // Créer un enregistrement de mouvement de stock
  await prisma.stockMovement.create({
    data: {
      productId,
      quantity,
      reason,
      previousStock: product.stock,
      newStock,
    },
  })

  return updatedProduct
}

/**
 * Récupérer les mouvements de stock d'un produit
 */
export async function getStockMovements(productId?: string) {
  const where: any = {}

  if (productId) {
    where.productId = productId
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return movements
}

/**
 * Obtenir les alertes de stock bas
 */
export async function getLowStockAlerts() {
  const products = await prisma.product.findMany({
    where: {
      stock: {
        lte: prisma.raw('minStock'),
      },
    },
    orderBy: { stock: 'asc' },
  })

  return products
}
