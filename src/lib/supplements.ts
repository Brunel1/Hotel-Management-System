import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des suppléments
 */

/**
 * Créer un nouveau supplément
 */
export async function createSupplement(data: {
  name: string
  description?: string
  price: number
  type: string
}) {
  const supplement = await prisma.supplement.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      type: data.type,
    },
  })

  return supplement
}

/**
 * Récupérer tous les suppléments actifs
 */
export async function getAllSupplements() {
  const supplements = await prisma.supplement.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return supplements
}

/**
 * Récupérer un supplément par ID
 */
export async function getSupplementById(id: string) {
  const supplement = await prisma.supplement.findUnique({
    where: { id },
  })

  return supplement
}

/**
 * Mettre à jour un supplément
 */
export async function updateSupplement(id: string, data: {
  name?: string
  description?: string
  price?: number
  type?: string
  isActive?: boolean
}) {
  const supplement = await prisma.supplement.update({
    where: { id },
    data,
  })

  return supplement
}

/**
 * Désactiver un supplément
 */
export async function deactivateSupplement(id: string) {
  const supplement = await prisma.supplement.update({
    where: { id },
    data: { isActive: false },
  })

  return supplement
}

/**
 * Ajouter des suppléments à une réservation
 */
export async function addSupplementsToBooking(bookingId: string, supplements: Array<{ supplementId: string; quantity: number }>) {
  const bookingSupplements = await Promise.all(
    supplements.map(async (supplement) => {
      const supplementData = await prisma.supplement.findUnique({
        where: { id: supplement.supplementId },
      })

      if (!supplementData) {
        throw new Error('Supplément non trouvé')
      }

      const totalPrice = Number(supplementData.price) * supplement.quantity

      const bookingSupplement = await prisma.bookingSupplement.create({
        data: {
          bookingId,
          supplementId: supplement.supplementId,
          quantity: supplement.quantity,
          totalPrice,
        },
      })

      return bookingSupplement
    })
  )

  // Mettre à jour le prix total de la réservation
  const totalSupplementsPrice = bookingSupplements.reduce((sum, bs) => sum + Number(bs.totalPrice), 0)
  
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      totalPrice: { increment: totalSupplementsPrice },
    },
  })

  return { booking, bookingSupplements }
}

/**
 * Récupérer les suppléments d'une réservation
 */
export async function getBookingSupplements(bookingId: string) {
  const bookingSupplements = await prisma.bookingSupplement.findMany({
    where: { bookingId },
    include: {
      supplement: true,
    },
  })

  return bookingSupplements
}

/**
 * Calculer le prix total des suppléments pour une réservation
 */
export async function calculateSupplementsTotal(supplements: Array<{ supplementId: string; quantity: number }>): Promise<number> {
  let total = 0

  for (const supplement of supplements) {
    const supplementData = await prisma.supplement.findUnique({
      where: { id: supplement.supplementId },
    })

    if (supplementData) {
      total += Number(supplementData.price) * supplement.quantity
    }
  }

  return total
}
