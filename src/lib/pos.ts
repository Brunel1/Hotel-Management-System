import { prisma } from '@/lib/prisma'

/**
 * Service de gestion du système de caisse (POS)
 */

/**
 * Créer une transaction de caisse
 */
export async function createTransaction(data: {
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  paymentMethod: string
  bookingId?: string
  userId?: string
}) {
  // Calculer le total
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Créer la transaction
  const transaction = await prisma.posTransaction.create({
    data: {
      total,
      paymentMethod: data.paymentMethod,
      bookingId: data.bookingId,
      userId: data.userId,
      status: 'COMPLETED',
    },
  })

  // Créer les lignes de transaction et ajuster le stock
  for (const item of data.items) {
    await prisma.posTransactionItem.create({
      data: {
        transactionId: transaction.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      },
    })

    // Ajuster le stock
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    })
  }

  return transaction
}

/**
 * Récupérer toutes les transactions
 */
export async function getTransactions(filters?: {
  startDate?: Date
  endDate?: Date
  paymentMethod?: string
  bookingId?: string
}) {
  const where: any = {}

  if (filters?.startDate && filters?.endDate) {
    where.createdAt = {
      gte: filters.startDate,
      lte: filters.endDate,
    }
  }
  if (filters?.paymentMethod) {
    where.paymentMethod = filters.paymentMethod
  }
  if (filters?.bookingId) {
    where.bookingId = filters.bookingId
  }

  const transactions = await prisma.posTransaction.findMany({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      },
      booking: {
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return transactions
}

/**
 * Obtenir les statistiques de caisse
 */
export async function getPOSStatistics(startDate: Date, endDate: Date) {
  const transactions = await prisma.posTransaction.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'COMPLETED',
    },
    include: {
      items: true,
    },
  })

  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total), 0)
  const totalTransactions = transactions.length
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  // Regrouper par méthode de paiement
  const byPaymentMethod = transactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + Number(t.total)
    return acc
  }, {} as Record<string, number>)

  return {
    totalRevenue,
    totalTransactions,
    averageTransaction,
    byPaymentMethod,
  }
}

/**
 * Annuler une transaction
 */
export async function refundTransaction(transactionId: string) {
  const transaction = await prisma.posTransaction.findUnique({
    where: { id: transactionId },
    include: { items: true },
  })

  if (!transaction) {
    throw new Error('Transaction non trouvée')
  }

  // Remettre le stock
  for (const item of transaction.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    })
  }

  // Marquer comme remboursé
  const refundedTransaction = await prisma.posTransaction.update({
    where: { id: transactionId },
    data: { status: 'REFUNDED' },
  })

  return refundedTransaction
}
