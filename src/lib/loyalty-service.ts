/**
 * Système de fidélité avancé
 * Niveaux de fidélité, points multipliés, partage familial et partenariats
 */

export interface LoyaltyLevel {
  id: string
  name: string
  pointsRequired: number
  multiplier: number
  benefits: string[]
  color: string
}

export interface LoyaltyAccount {
  userId: string
  points: number
  level: string
  totalEarned: number
  totalRedeemed: number
  familyGroupId?: string
  partnerHotels: string[]
}

export interface PointsTransaction {
  id: string
  userId: string
  points: number
  type: 'earned' | 'redeemed' | 'expired' | 'transferred'
  reason: string
  bookingId?: string
  createdAt: Date
  expiresAt?: Date
}

export interface FamilyGroup {
  id: string
  name: string
  ownerId: string
  members: string[]
  sharedPoints: number
  createdAt: Date
}

export interface PartnerHotel {
  id: string
  name: string
  location: string
  pointMultiplier: number
  benefits: string[]
}

/**
 * Classe de gestion du programme de fidélité
 */
export class LoyaltyService {
  private static instance: LoyaltyService
  private levels: LoyaltyLevel[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      pointsRequired: 0,
      multiplier: 1.0,
      benefits: ['Accès au programme', 'Points de base'],
      color: '#CD7F32',
    },
    {
      id: 'silver',
      name: 'Argent',
      pointsRequired: 5000,
      multiplier: 1.25,
      benefits: ['Points x1.25', 'Check-in prioritaire', 'Welcome drink'],
      color: '#C0C0C0',
    },
    {
      id: 'gold',
      name: 'Or',
      pointsRequired: 15000,
      multiplier: 1.5,
      benefits: ['Points x1.5', 'Check-in prioritaire', 'Welcome drink', 'Late check-out gratuit'],
      color: '#FFD700',
    },
    {
      id: 'platinum',
      name: 'Platine',
      pointsRequired: 50000,
      multiplier: 2.0,
      benefits: ['Points x2.0', 'Check-in prioritaire', 'Welcome drink', 'Late check-out gratuit', 'Upgrade gratuit', 'Petit-déjeuner inclus'],
      color: '#E5E4E2',
    },
  ]

  private constructor() {}

  static getInstance(): LoyaltyService {
    if (!LoyaltyService.instance) {
      LoyaltyService.instance = new LoyaltyService()
    }
    return LoyaltyService.instance
  }

  /**
   * Obtenir tous les niveaux de fidélité
   */
  getLevels(): LoyaltyLevel[] {
    return this.levels
  }

  /**
   * Obtenir le niveau d'un utilisateur
   */
  async getUserLevel(userId: string): Promise<LoyaltyLevel> {
    const account = await this.getLoyaltyAccount(userId)
    if (!account) return this.levels[0]

    // Trouver le niveau approprié
    let currentLevel = this.levels[0]
    for (const level of this.levels) {
      if (account.points >= level.pointsRequired) {
        currentLevel = level
      }
    }

    return currentLevel
  }

  /**
   * Calculer les points gagnés pour une réservation
   */
  async calculatePointsEarned(
    userId: string,
    bookingAmount: number,
    roomType: string
  ): Promise<number> {
    const level = await this.getUserLevel(userId)
    const basePoints = Math.floor(bookingAmount / 1000) // 1 point par 1000 MGA

    // Multiplicateur selon le niveau
    let points = basePoints * level.multiplier

    // Multiplicateur selon le type de chambre
    const roomMultiplier = this.getRoomTypeMultiplier(roomType)
    points *= roomMultiplier

    // Multiplicateur selon les partenariats
    const partnerMultiplier = await this.getPartnerMultiplier(userId)
    points *= partnerMultiplier

    return Math.floor(points)
  }

  /**
   * Ajouter des points à un utilisateur
   */
  async addPoints(
    userId: string,
    points: number,
    reason: string,
    bookingId?: string
  ): Promise<void> {
    try {
      const account = await this.getLoyaltyAccount(userId)
      if (!account) {
        // Créer un compte si inexistant
        await this.createLoyaltyAccount(userId)
      }

      const transaction: PointsTransaction = {
        id: crypto.randomUUID(),
        userId,
        points,
        type: 'earned',
        reason,
        bookingId,
        createdAt: new Date(),
        expiresAt: this.calculateExpirationDate(),
      }

      // Sauvegarder la transaction
      await this.saveTransaction(transaction)

      // Mettre à jour le compte
      await this.updateAccountPoints(userId, points, 'earned')
    } catch (error) {
      console.error('Erreur lors de l\'ajout des points:', error)
    }
  }

  /**
   * Rédeem des points
   */
  async redeemPoints(
    userId: string,
    points: number,
    reason: string
  ): Promise<boolean> {
    try {
      const account = await this.getLoyaltyAccount(userId)
      if (!account || account.points < points) {
        return false
      }

      const transaction: PointsTransaction = {
        id: crypto.randomUUID(),
        userId,
        points: -points,
        type: 'redeemed',
        reason,
        createdAt: new Date(),
      }

      await this.saveTransaction(transaction)
      await this.updateAccountPoints(userId, -points, 'redeemed')

      return true
    } catch (error) {
      console.error('Erreur lors de la rédemption des points:', error)
      return false
    }
  }

  /**
   * Créer un groupe familial
   */
  async createFamilyGroup(
    ownerId: string,
    name: string,
    memberIds: string[]
  ): Promise<FamilyGroup> {
    const group: FamilyGroup = {
      id: crypto.randomUUID(),
      name,
      ownerId,
      members: [ownerId, ...memberIds],
      sharedPoints: 0,
      createdAt: new Date(),
    }

    await this.saveFamilyGroup(group)

    // Mettre à jour les comptes des membres
    for (const memberId of group.members) {
      await this.updateUserFamilyGroup(memberId, group.id)
    }

    return group
  }

  /**
   * Transférer des points entre membres de famille
   */
  async transferFamilyPoints(
    fromUserId: string,
    toUserId: string,
    points: number
  ): Promise<boolean> {
    try {
      const fromAccount = await this.getLoyaltyAccount(fromUserId)
      const toAccount = await this.getLoyaltyAccount(toUserId)

      if (!fromAccount || !toAccount) return false
      if (fromAccount.familyGroupId !== toAccount.familyGroupId) return false
      if (fromAccount.points < points) return false

      // Déduire les points de l'expéditeur
      await this.redeemPoints(fromUserId, points, 'Transfert familial')

      // Ajouter les points au destinataire
      await this.addPoints(toUserId, points, 'Transfert familial')

      return true
    } catch (error) {
      console.error('Erreur lors du transfert de points:', error)
      return false
    }
  }

  /**
   * Ajouter un partenaire hôtel
   */
  async addPartnerHotel(partner: Omit<PartnerHotel, 'id'>): Promise<PartnerHotel> {
    const newPartner: PartnerHotel = {
      ...partner,
      id: crypto.randomUUID(),
    }

    await this.savePartnerHotel(newPartner)
    return newPartner
  }

  /**
   * Obtenir les partenaires d'un utilisateur
   */
  async getUserPartners(userId: string): Promise<PartnerHotel[]> {
    const account = await this.getLoyaltyAccount(userId)
    if (!account || !account.partnerHotels) return []

    const partners: PartnerHotel[] = []
    for (const partnerId of account.partnerHotels) {
      const partner = await this.getPartnerHotel(partnerId)
      if (partner) partners.push(partner)
    }

    return partners
  }

  /**
   * Obtenir l'historique des transactions d'un utilisateur
   */
  async getUserTransactions(userId: string, limit: number = 50): Promise<PointsTransaction[]> {
    try {
      const response = await fetch(`/api/loyalty/transactions?userId=${userId}&limit=${limit}`)
      const transactions = await response.json()
      return transactions
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error)
      return []
    }
  }

  /**
   * Vérifier et expirer les points périmés
   */
  async expirePoints(): Promise<void> {
    try {
      const response = await fetch('/api/loyalty/expire', {
        method: 'POST',
      })
      await response.json()
    } catch (error) {
      console.error('Erreur lors de l\'expiration des points:', error)
    }
  }

  /**
   * Méthodes utilitaires privées
   */
  private async getLoyaltyAccount(userId: string): Promise<LoyaltyAccount | null> {
    try {
      const response = await fetch(`/api/loyalty/account?userId=${userId}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération du compte:', error)
      return null
    }
  }

  private async createLoyaltyAccount(userId: string): Promise<void> {
    try {
      await fetch('/api/loyalty/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          points: 0,
          level: 'bronze',
          totalEarned: 0,
          totalRedeemed: 0,
        }),
      })
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error)
    }
  }

  private async saveTransaction(transaction: PointsTransaction): Promise<void> {
    try {
      await fetch('/api/loyalty/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la transaction:', error)
    }
  }

  private async updateAccountPoints(
    userId: string,
    points: number,
    type: 'earned' | 'redeemed'
  ): Promise<void> {
    try {
      await fetch(`/api/loyalty/account/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, type }),
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compte:', error)
    }
  }

  private async saveFamilyGroup(group: FamilyGroup): Promise<void> {
    try {
      await fetch('/api/loyalty/family-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du groupe familial:', error)
    }
  }

  private async updateUserFamilyGroup(userId: string, familyGroupId: string): Promise<void> {
    try {
      await fetch(`/api/loyalty/account/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyGroupId }),
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du groupe familial:', error)
    }
  }

  private async savePartnerHotel(partner: PartnerHotel): Promise<void> {
    try {
      await fetch('/api/loyalty/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partner),
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du partenaire:', error)
    }
  }

  private async getPartnerHotel(partnerId: string): Promise<PartnerHotel | null> {
    try {
      const response = await fetch(`/api/loyalty/partners/${partnerId}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération du partenaire:', error)
      return null
    }
  }

  private async getPartnerMultiplier(userId: string): Promise<number> {
    const partners = await this.getUserPartners(userId)
    if (partners.length === 0) return 1.0

    // Prendre le multiplicateur le plus élevé
    return Math.max(...partners.map(p => p.pointMultiplier))
  }

  private getRoomTypeMultiplier(roomType: string): number {
    const multipliers: Record<string, number> = {
      STANDARD: 1.0,
      DELUXE: 1.25,
      SUITE: 1.5,
      PRESIDENTIAL: 2.0,
    }
    return multipliers[roomType] || 1.0
  }

  private calculateExpirationDate(): Date {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 2) // Points expirent après 2 ans
    return date
  }
}

export const loyaltyService = LoyaltyService.getInstance()
