/**
 * Système de suggestions
 * Suggestions intelligentes basées sur le comportement, préférences, historique et contexte
 */

export interface Suggestion {
  id: string
  userId: string
  type: 'room_upgrade' | 'service' | 'amenity' | 'activity' | 'dining' | 'offer'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  confidence: number
  validUntil: Date
  actionUrl?: string
  metadata: Record<string, any>
  viewed: boolean
  accepted: boolean
  dismissed: boolean
  createdAt: Date
}

export interface UserPreference {
  userId: string
  category: string
  preferences: Record<string, any>
  updatedAt: Date
}

export interface SuggestionRule {
  id: string
  name: string
  condition: string
  suggestionType: Suggestion['type']
  template: {
    title: string
    description: string
  }
  priority: Suggestion['priority']
  enabled: boolean
}

/**
 * Classe de gestion du système de suggestions
 */
export class SuggestionSystem {
  private static instance: SuggestionSystem
  private suggestions: Suggestion[] = []
  private preferences: UserPreference[] = []
  private rules: SuggestionRule[] = []

  private constructor() {
    this.initializeService()
  }

  static getInstance(): SuggestionSystem {
    if (!SuggestionSystem.instance) {
      SuggestionSystem.instance = new SuggestionSystem()
    }
    return SuggestionSystem.instance
  }

  /**
   * Initialiser le service
   */
  private async initializeService() {
    await this.loadSuggestions()
    await this.loadPreferences()
    await this.loadRules()
  }

  /**
   * Générer des suggestions pour un utilisateur
   */
  async generateSuggestions(userId: string, context?: Record<string, any>): Promise<Suggestion[]> {
    const userPreferences = this.getUserPreferences(userId)
    const newSuggestions: Suggestion[] = []

    // Appliquer les règles actives
    for (const rule of this.rules.filter(r => r.enabled)) {
      if (this.evaluateRule(rule, userPreferences, context)) {
        const suggestion = this.createSuggestionFromRule(rule, userId, context)
        if (suggestion) {
          newSuggestions.push(suggestion)
        }
      }
    }

    // Sauvegarder les nouvelles suggestions
    for (const suggestion of newSuggestions) {
      this.suggestions.push(suggestion)
      await this.saveSuggestion(suggestion)
    }

    return newSuggestions
  }

  /**
   * Évaluer une règle
   */
  private evaluateRule(rule: SuggestionRule, preferences: UserPreference[], context?: Record<string, any>): boolean {
    // En production, utiliser un moteur de règles sophistiqué
    // Pour l'instant, simulation simple
    return Math.random() > 0.5
  }

  /**
   * Créer une suggestion à partir d'une règle
   */
  private createSuggestionFromRule(
    rule: SuggestionRule,
    userId: string,
    context?: Record<string, any>
  ): Suggestion | null {
    const suggestion: Suggestion = {
      id: crypto.randomUUID(),
      userId,
      type: rule.suggestionType,
      title: rule.template.title,
      description: rule.template.description,
      priority: rule.priority,
      confidence: 0.7 + Math.random() * 0.2,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      metadata: { ruleId: rule.id, context },
      viewed: false,
      accepted: false,
      dismissed: false,
      createdAt: new Date(),
    }

    return suggestion
  }

  /**
   * Obtenir les suggestions d'un utilisateur
   */
  getUserSuggestions(userId: string): Suggestion[] {
    const now = new Date()
    return this.suggestions.filter(
      s => s.userId === userId && s.validUntil > now && !s.dismissed
    )
  }

  /**
   * Obtenir les suggestions non vues
   */
  getUnviewedSuggestions(userId: string): Suggestion[] {
    return this.getUserSuggestions(userId).filter(s => !s.viewed)
  }

  /**
   * Marquer une suggestion comme vue
   */
  async markAsViewed(suggestionId: string): Promise<boolean> {
    const suggestion = this.suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return false

    suggestion.viewed = true
    await this.saveSuggestion(suggestion)

    return true
  }

  /**
   * Accepter une suggestion
   */
  async acceptSuggestion(suggestionId: string): Promise<boolean> {
    const suggestion = this.suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return false

    suggestion.accepted = true
    suggestion.viewed = true
    await this.saveSuggestion(suggestion)

    // En production, déclencher l'action associée

    return true
  }

  /**
   * Rejeter une suggestion
   */
  async dismissSuggestion(suggestionId: string): Promise<boolean> {
    const suggestion = this.suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return false

    suggestion.dismissed = true
    await this.saveSuggestion(suggestion)

    // Mettre à jour les préférences de l'utilisateur
    await this.updatePreferencesFromDismissal(suggestion)

    return true
  }

  /**
   * Mettre à jour les préférences suite à un rejet
   */
  private async updatePreferencesFromDismissal(suggestion: Suggestion): Promise<void> {
    let preference = this.preferences.find(p => p.userId === suggestion.userId && p.category === suggestion.type)

    if (!preference) {
      preference = {
        userId: suggestion.userId,
        category: suggestion.type,
        preferences: {},
        updatedAt: new Date(),
      }
      this.preferences.push(preference)
    }

    preference.preferences.dismissed = (preference.preferences.dismissed || 0) + 1
    preference.updatedAt = new Date()
    await this.savePreference(preference)
  }

  /**
   * Obtenir les préférences d'un utilisateur
   */
  getUserPreferences(userId: string): UserPreference[] {
    return this.preferences.filter(p => p.userId === userId)
  }

  /**
   * Mettre à jour les préférences d'un utilisateur
   */
  async updatePreferences(userId: string, category: string, preferences: Record<string, any>): Promise<UserPreference> {
    let preference = this.preferences.find(p => p.userId === userId && p.category === category)

    if (preference) {
      preference.preferences = { ...preference.preferences, ...preferences }
      preference.updatedAt = new Date()
    } else {
      preference = {
        userId,
        category,
        preferences,
        updatedAt: new Date(),
      }
      this.preferences.push(preference)
    }

    await this.savePreference(preference)
    return preference
  }

  /**
   * Créer une règle de suggestion
   */
  async createRule(
    name: string,
    condition: string,
    suggestionType: Suggestion['type'],
    template: { title: string; description: string },
    priority: Suggestion['priority']
  ): Promise<SuggestionRule> {
    const rule: SuggestionRule = {
      id: crypto.randomUUID(),
      name,
      condition,
      suggestionType,
      template,
      priority,
      enabled: true,
    }

    this.rules.push(rule)
    await this.saveRule(rule)

    return rule
  }

  /**
   * Obtenir toutes les règles
   */
  getRules(): SuggestionRule[] {
    return this.rules
  }

  /**
   * Activer/désactiver une règle
   */
  async toggleRule(ruleId: string, enabled: boolean): Promise<boolean> {
    const rule = this.rules.find(r => r.id === ruleId)
    if (!rule) return false

    rule.enabled = enabled
    await this.saveRule(rule)

    return true
  }

  /**
   * Obtenir les statistiques de suggestions
   */
  getSuggestionStats(userId?: string): {
    total: number
    viewed: number
    accepted: number
    dismissed: number
    acceptanceRate: number
  } {
    const suggestions = userId
      ? this.suggestions.filter(s => s.userId === userId)
      : this.suggestions

    const total = suggestions.length
    const viewed = suggestions.filter(s => s.viewed).length
    const accepted = suggestions.filter(s => s.accepted).length
    const dismissed = suggestions.filter(s => s.dismissed).length
    const acceptanceRate = viewed > 0 ? (accepted / viewed) * 100 : 0

    return {
      total,
      viewed,
      accepted,
      dismissed,
      acceptanceRate,
    }
  }

  /**
   * Nettoyer les suggestions expirées
   */
  async cleanupExpiredSuggestions(): Promise<number> {
    const now = new Date()
    const expired = this.suggestions.filter(s => s.validUntil < now)

    for (const suggestion of expired) {
      const index = this.suggestions.indexOf(suggestion)
      if (index > -1) {
        this.suggestions.splice(index, 1)
      }
    }

    return expired.length
  }

  /**
   * Méthodes privées
   */
  private async loadSuggestions(): Promise<void> {
    // En production, charger depuis la base de données
    this.suggestions = []
  }

  private async loadPreferences(): Promise<void> {
    // En production, charger depuis la base de données
    this.preferences = []
  }

  private async loadRules(): Promise<void> {
    // En production, charger depuis la base de données
    this.rules = [
      {
        id: 'r1',
        name: 'Upgrade chambre suite',
        condition: 'user.hasBookedStandardRoom && user.isLoyal',
        suggestionType: 'room_upgrade',
        template: {
          title: 'Passez à la suite !',
          description: 'Profitez d\'une mise à niveau vers une suite avec 20% de réduction.',
        },
        priority: 'medium',
        enabled: true,
      },
      {
        id: 'r2',
        name: 'Spa après arrivée',
        condition: 'user.hasJustArrived && !user.hasUsedSpa',
        suggestionType: 'service',
        template: {
          title: 'Détendez-vous au spa',
          description: 'Offrez-vous un massage après votre voyage.',
        },
        priority: 'low',
        enabled: true,
      },
    ]
  }

  private async saveSuggestion(suggestion: Suggestion): Promise<void> {
    // En production, sauvegarder dans la base de données
  }

  private async savePreference(preference: UserPreference): Promise<void> {
    // En production, sauvegarder dans la base de données
  }

  private async saveRule(rule: SuggestionRule): Promise<void> {
    // En production, sauvegarder dans la base de données
  }
}

export const suggestionSystem = SuggestionSystem.getInstance()
