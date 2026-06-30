import { prisma } from '@/lib/prisma'

/**
 * Service de segmentation des clients
 * Catégorise les clients selon leur comportement et leurs dépenses
 */

export enum CustomerSegment {
  NEW = 'NEW', // Nouveau client (0-1 réservation)
  OCCASIONAL = 'OCCASIONAL', // Client occasionnel (2-5 réservations)
  REGULAR = 'REGULAR', // Client régulier (6-10 réservations)
  LOYAL = 'LOYAL', // Client fidèle (11-20 réservations)
  VIP = 'VIP', // Client VIP (20+ réservations ou haut niveau de fidélité)
  INACTIVE = 'INACTIVE', // Client inactif (pas de réservation depuis 6 mois)
}

export enum CustomerValue {
  LOW = 'LOW', // Faible valeur (dépenses < 500 000 Ar)
  MEDIUM = 'MEDIUM', // Valeur moyenne (dépenses 500 000 - 2 000 000 Ar)
  HIGH = 'HIGH', // Haute valeur (dépenses 2 000 000 - 5 000 000 Ar)
  PREMIUM = 'PREMIUM', // Valeur premium (dépenses > 5 000 000 Ar)
}

interface CustomerSegmentation {
  segment: CustomerSegment
  value: CustomerValue
  loyaltyTier: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  recommendations: string[]
}

/**
 * Calculer le segment d'un client
 */
export async function calculateCustomerSegment(userId: string): Promise<CustomerSegmentation> {
  // Récupérer les données du client
  const crmRecord = await prisma.cRMRecord.findUnique({
    where: { userId },
  })

  const loyaltyPoints = await prisma.loyaltyPoint.findUnique({
    where: { userId },
  })

  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  // Calculer le segment basé sur le nombre de réservations
  let segment: CustomerSegment
  const totalBookings = bookings.length

  if (totalBookings === 0) {
    segment = CustomerSegment.NEW
  } else if (totalBookings <= 2) {
    segment = CustomerSegment.OCCASIONAL
  } else if (totalBookings <= 6) {
    segment = CustomerSegment.REGULAR
  } else if (totalBookings <= 12) {
    segment = CustomerSegment.LOYAL
  } else {
    segment = CustomerSegment.VIP
  }

  // Vérifier si le client est inactif (pas de réservation depuis 6 mois)
  if (totalBookings > 0) {
    const lastBooking = bookings[0]
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    if (new Date(lastBooking.createdAt) < sixMonthsAgo) {
      segment = CustomerSegment.INACTIVE
    }
  }

  // Calculer la valeur du client
  let value: CustomerValue
  const totalSpent = crmRecord?.totalSpent ? Number(crmRecord.totalSpent) : 0

  if (totalSpent < 500000) {
    value = CustomerValue.LOW
  } else if (totalSpent < 2000000) {
    value = CustomerValue.MEDIUM
  } else if (totalSpent < 5000000) {
    value = CustomerValue.HIGH
  } else {
    value = CustomerValue.PREMIUM
  }

  // Niveau de fidélité
  const loyaltyTier = loyaltyPoints?.tier || 'BRONZE'

  // Calculer le niveau de risque
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
  
  if (segment === CustomerSegment.INACTIVE) {
    riskLevel = 'HIGH'
  } else if (segment === CustomerSegment.NEW) {
    riskLevel = 'MEDIUM'
  } else if (segment === CustomerSegment.VIP || segment === CustomerSegment.LOYAL) {
    riskLevel = 'LOW'
  }

  // Générer des recommandations personnalisées
  const recommendations = generateRecommendations(segment, value, loyaltyTier)

  return {
    segment,
    value,
    loyaltyTier,
    riskLevel,
    recommendations,
  }
}

/**
 * Générer des recommandations basées sur le segment
 */
function generateRecommendations(
  segment: CustomerSegment,
  value: CustomerValue,
  loyaltyTier: string
): string[] {
  const recommendations: string[] = []

  switch (segment) {
    case CustomerSegment.NEW:
      recommendations.push('Offrir une réduction de bienvenue de 10%')
      recommendations.push('Envoyer un email de présentation des services')
      recommendations.push('Proposer un guide de l\'hôtel')
      break
    case CustomerSegment.OCCASIONAL:
      recommendations.push('Envoyer des offres promotionnelles personnalisées')
      recommendations.push('Proposer un programme de fidélité')
      recommendations.push('Demander un avis après chaque séjour')
      break
    case CustomerSegment.REGULAR:
      recommendations.push('Offrir des mises à niveau gratuites')
      recommendations.push('Proposer des réservations prioritaires')
      recommendations.push('Inviter à des événements exclusifs')
      break
    case CustomerSegment.LOYAL:
      recommendations.push('Offrir des services de conciergerie')
      recommendations.push('Proposer des tarifs préférentiels')
      recommendations.push('Accès aux installations VIP')
      break
    case CustomerSegment.VIP:
      recommendations.push('Service personnalisé 24/7')
      recommendations.push('Accès aux suites présidentielles')
      recommendations.push('Offres exclusives et sur-mesure')
      recommendations.push('Invitations aux événements privés')
      break
    case CustomerSegment.INACTIVE:
      recommendations.push('Envoyer une offre de réengagement')
      recommendations.push('Demander les raisons de l\'inactivité')
      recommendations.push('Proposer une réduction spéciale')
      break
  }

  switch (value) {
    case CustomerValue.PREMIUM:
      recommendations.push('Offrir des expériences exclusives')
      recommendations.push('Accès prioritaire aux services')
      break
  }

  if (loyaltyTier === 'PLATINUM' || loyaltyTierTier === 'DIAMOND') {
    recommendations.push('Offrir des récompenses exclusives')
    recommendations.push('Accès aux événements VIP')
  }

  return recommendations
}

/**
 * Récupérer tous les clients d'un segment spécifique
 */
export async function getCustomersBySegment(segment: CustomerSegment) {
  const crmRecords = await prisma.cRMRecord.findMany({
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  })

  const segmentedCustomers = []

  for (const crm of crmRecords) {
    const segmentation = await calculateCustomerSegment(crm.userId)
    if (segmentation.segment === segment) {
      segmentedCustomers.push({
        ...crm,
        segmentation,
      })
    }
  }

  return segmentedCustomers
}

/**
 * Récupérer les statistiques de segmentation
 */
export async function getSegmentationStats() {
  const crmRecords = await prisma.cRMRecord.findMany()

  const stats = {
    total: crmRecords.length,
    segments: {} as Record<CustomerSegment, number>,
    values: {} as Record<CustomerValue, number>,
  }

  // Initialiser les compteurs
  Object.values(CustomerSegment).forEach(segment => {
    stats.segments[segment] = 0
  })
  Object.values(CustomerValue).forEach(value => {
    stats.values[value] = 0
  })

  // Calculer les statistiques
  for (const crm of crmRecords) {
    const segmentation = await calculateCustomerSegment(crm.userId)
    stats.segments[segmentation.segment]++
    stats.values[segmentation.value]++
  }

  return stats
}
