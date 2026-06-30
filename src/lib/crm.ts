import { prisma } from '@/lib/prisma'

/**
 * Service d'intégration CRM
 * Gestion des données clients pour le CRM
 */

/**
 * Synchroniser un client avec le CRM
 */
export async function syncCustomerToCRM(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      reviews: true,
      loyaltyPoints: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) {
    throw new Error('Utilisateur introuvable')
  }

  // Préparer les données CRM
  const crmData = {
    id: user.id,
    email: user.email,
    firstName: user.profile?.firstName || '',
    lastName: user.profile?.lastName || '',
    phone: user.profile?.phone || '',
    totalBookings: user.bookings.length,
    totalSpent: user.bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0),
    averageRating: user.reviews.length > 0
      ? user.reviews.reduce((sum, review) => sum + review.rating, 0) / user.reviews.length
      : 0,
    loyaltyPoints: user.loyaltyPoints.reduce((sum, point) => sum + point.points, 0),
    lastBooking: user.bookings[0]?.checkIn || null,
    createdAt: user.createdAt,
  }

  // Note: En production, envoyer ces données à un CRM externe (Salesforce, HubSpot, etc.)
  // Pour l'instant, nous enregistrons dans une table CRM locale
  await prisma.cRMRecord.upsert({
    where: { userId },
    update: crmData,
    create: {
      userId,
      ...crmData,
    },
  })

  return crmData
}

/**
 * Récupérer les données CRM d'un client
 */
export async function getCustomerCRMData(userId: string) {
  const crmRecord = await prisma.cRMRecord.findUnique({
    where: { userId },
  })

  if (!crmRecord) {
    return await syncCustomerToCRM(userId)
  }

  return crmRecord
}

/**
 * Récupérer les clients VIP (loyaltyPoints > 1000)
 */
export async function getVIPCustomers() {
  const vipCustomers = await prisma.cRMRecord.findMany({
    where: {
      loyaltyPoints: {
        gte: 1000,
      },
    },
    orderBy: {
      loyaltyPoints: 'desc',
    },
  })

  return vipCustomers
}

/**
 * Récupérer les clients inactifs (pas de réservation depuis 6 mois)
 */
export async function getInactiveCustomers() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const inactiveCustomers = await prisma.cRMRecord.findMany({
    where: {
      OR: [
        { lastBooking: null },
        { lastBooking: { lt: sixMonthsAgo } },
      ],
    },
    orderBy: {
      lastBooking: 'asc',
    },
  })

  return inactiveCustomers
}

/**
 * Calculer la valeur à vie (LTV) d'un client
 */
export async function calculateCustomerLTV(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    select: { totalPrice: true },
  })

  const ltv = bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0)

  return ltv
}

/**
 * Segmenter les clients par valeur
 */
export async function segmentCustomers() {
  const allCustomers = await prisma.cRMRecord.findMany()

  const segments = {
    highValue: allCustomers.filter(c => c.totalSpent >= 5000),
    mediumValue: allCustomers.filter(c => c.totalSpent >= 1000 && c.totalSpent < 5000),
    lowValue: allCustomers.filter(c => c.totalSpent < 1000),
  }

  return segments
}

/**
 * Exporter les données CRM en CSV
 */
export async function exportCRMData() {
  const customers = await prisma.cRMRecord.findMany({
    orderBy: { totalSpent: 'desc' },
  })

  const headers = ['ID', 'Email', 'Prénom', 'Nom', 'Téléphone', 'Réservations', 'Total Dépensé', 'Points Fidélité', 'Dernière Réservation']
  const rows = customers.map(c => [
    c.id,
    c.email,
    c.firstName,
    c.lastName,
    c.phone,
    c.totalBookings,
    c.totalSpent,
    c.loyaltyPoints,
    c.lastBooking,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return csvContent
}
