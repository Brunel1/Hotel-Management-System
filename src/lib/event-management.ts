/**
 * Service de gestion des événements
 * Création d'événements, gestion des participants, calendrier, notifications automatiques
 */

export interface Event {
  id: string
  name: string
  description: string
  type: 'conference' | 'wedding' | 'corporate' | 'social' | 'other'
  startDate: Date
  endDate: Date
  location: string
  capacity: number
  registeredCount: number
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  organizerId: string
  createdAt: Date
  updatedAt: Date
}

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  status: 'registered' | 'confirmed' | 'cancelled' | 'attended'
  registeredAt: Date
  notes?: string
}

export interface EventReminder {
  id: string
  eventId: string
  type: 'email' | 'sms' | 'push'
  scheduledAt: Date
  sent: boolean
  sentAt?: Date
  message: string
}

/**
 * Classe de gestion des événements
 */
export class EventManagementService {
  private static instance: EventManagementService
  private events: Event[] = []
  private registrations: EventRegistration[] = []
  private reminders: EventReminder[] = []

  private constructor() {
    this.initializeService()
  }

  static getInstance(): EventManagementService {
    if (!EventManagementService.instance) {
      EventManagementService.instance = new EventManagementService()
    }
    return EventManagementService.instance
  }

  /**
   * Initialiser le service
   */
  private async initializeService() {
    await this.loadEvents()
    await this.loadRegistrations()
    await this.loadReminders()
  }

  /**
   * Créer un événement
   */
  async createEvent(event: Omit<Event, 'id' | 'registeredCount' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      registeredCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.events.push(newEvent)
    await this.saveEvent(newEvent)

    return newEvent
  }

  /**
   * Obtenir tous les événements
   */
  getEvents(): Event[] {
    return this.events
  }

  /**
   * Obtenir un événement par ID
   */
  getEvent(id: string): Event | undefined {
    return this.events.find(e => e.id === id)
  }

  /**
   * Mettre à jour un événement
   */
  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const event = this.events.find(e => e.id === id)
    if (!event) return null

    Object.assign(event, updates)
    event.updatedAt = new Date()
    await this.saveEvent(event)

    return event
  }

  /**
   * Supprimer un événement
   */
  async deleteEvent(id: string): Promise<boolean> {
    const index = this.events.findIndex(e => e.id === id)
    if (index === -1) return false

    this.events.splice(index, 1)
    
    // Supprimer les inscriptions et rappels associés
    this.registrations = this.registrations.filter(r => r.eventId !== id)
    this.reminders = this.reminders.filter(r => r.eventId !== id)
    
    await this.deleteEventFromDB(id)
    await this.deleteRegistrationsByEvent(id)
    await this.deleteRemindersByEvent(id)

    return true
  }

  /**
   * Inscrire un utilisateur à un événement
   */
  async registerUser(eventId: string, userId: string, notes?: string): Promise<EventRegistration> {
    const registration: EventRegistration = {
      id: crypto.randomUUID(),
      eventId,
      userId,
      status: 'registered',
      registeredAt: new Date(),
      notes,
    }

    this.registrations.push(registration)
    await this.saveRegistration(registration)

    // Mettre à jour le compteur d'inscriptions
    const event = this.getEvent(eventId)
    if (event) {
      event.registeredCount++
      await this.saveEvent(event)
    }

    return registration
  }

  /**
   * Annuler l'inscription d'un utilisateur
   */
  async cancelRegistration(eventId: string, userId: string): Promise<boolean> {
    const registration = this.registrations.find(r => r.eventId === eventId && r.userId === userId)
    if (!registration) return false

    registration.status = 'cancelled'
    await this.saveRegistration(registration)

    // Mettre à jour le compteur d'inscriptions
    const event = this.getEvent(eventId)
    if (event) {
      event.registeredCount--
      await this.saveEvent(event)
    }

    return true
  }

  /**
   * Obtenir les inscriptions d'un événement
   */
  getEventRegistrations(eventId: string): EventRegistration[] {
    return this.registrations.filter(r => r.eventId === eventId)
  }

  /**
   * Obtenir les événements d'un utilisateur
   */
  getUserEvents(userId: string): Event[] {
    const userRegistrationIds = this.registrations
      .filter(r => r.userId === userId && r.status === 'registered')
      .map(r => r.eventId)

    return this.events.filter(e => userRegistrationIds.includes(e.id))
  }

  /**
   * Créer un rappel pour un événement
   */
  async createReminder(
    eventId: string,
    type: EventReminder['type'],
    scheduledAt: Date,
    message: string
  ): Promise<EventReminder> {
    const reminder: EventReminder = {
      id: crypto.randomUUID(),
      eventId,
      type,
      scheduledAt,
      sent: false,
      message,
    }

    this.reminders.push(reminder)
    await this.saveReminder(reminder)

    return reminder
  }

  /**
   * Obtenir les rappels d'un événement
   */
  getEventReminders(eventId: string): EventReminder[] {
    return this.reminders.filter(r => r.eventId === eventId)
  }

  /**
   * Envoyer les rappels programmés
   */
  async sendScheduledReminders(): Promise<void> {
    const now = new Date()
    const pendingReminders = this.reminders.filter(r => !r.sent && r.scheduledAt <= now)

    for (const reminder of pendingReminders) {
      await this.sendReminder(reminder)
      reminder.sent = true
      reminder.sentAt = new Date()
      await this.saveReminder(reminder)
    }
  }

  /**
   * Obtenir les événements à venir
   */
  getUpcomingEvents(limit: number = 10): Event[] {
    const now = new Date()
    return this.events
      .filter(e => e.startDate >= now && e.status === 'published')
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit)
  }

  /**
   * Obtenir les événements en cours
   */
  getOngoingEvents(): Event[] {
    const now = new Date()
    return this.events.filter(e => e.startDate <= now && e.endDate >= now && e.status === 'ongoing')
  }

  /**
   * Vérifier la disponibilité pour un événement
   */
  checkAvailability(eventId: string): { available: boolean; remaining: number } {
    const event = this.getEvent(eventId)
    if (!event) return { available: false, remaining: 0 }

    const remaining = event.capacity - event.registeredCount
    return {
      available: remaining > 0,
      remaining,
    }
  }

  /**
   * Méthodes privées
   */
  private async sendReminder(reminder: EventReminder): Promise<void> {
    const event = this.getEvent(reminder.eventId)
    if (!event) return

    const registrations = this.getEventRegistrations(reminder.eventId)
    
    for (const registration of registrations) {
      if (registration.status === 'registered') {
        // Envoyer le rappel selon le type
        if (reminder.type === 'email') {
          await this.sendEmailReminder(registration.userId, event, reminder.message)
        } else if (reminder.type === 'sms') {
          await this.sendSMSReminder(registration.userId, event, reminder.message)
        } else if (reminder.type === 'push') {
          await this.sendPushReminder(registration.userId, event, reminder.message)
        }
      }
    }
  }

  private async sendEmailReminder(userId: string, event: Event, message: string): Promise<void> {
    // En production, envoyer un email
    console.log(`Email reminder sent to ${userId} for event ${event.name}: ${message}`)
  }

  private async sendSMSReminder(userId: string, event: Event, message: string): Promise<void> {
    // En production, envoyer un SMS
    console.log(`SMS reminder sent to ${userId} for event ${event.name}: ${message}`)
  }

  private async sendPushReminder(userId: string, event: Event, message: string): Promise<void> {
    // En production, envoyer une notification push
    console.log(`Push reminder sent to ${userId} for event ${event.name}: ${message}`)
  }

  private async loadEvents(): Promise<void> {
    // En production, charger depuis la base de données
    this.events = []
  }

  private async loadRegistrations(): Promise<void> {
    // En production, charger depuis la base de données
    this.registrations = []
  }

  private async loadReminders(): Promise<void> {
    // En production, charger depuis la base de données
    this.reminders = []
  }

  private async saveEvent(event: Event): Promise<void> {
    // En production, sauvegarder dans la base de données
  }

  private async deleteEventFromDB(id: string): Promise<void> {
    // En production, supprimer de la base de données
  }

  private async saveRegistration(registration: EventRegistration): Promise<void> {
    // En production, sauvegarder dans la base de données
  }

  private async deleteRegistrationsByEvent(eventId: string): Promise<void> {
    // En production, supprimer de la base de données
  }

  private async saveReminder(reminder: EventReminder): Promise<void> {
    // En production, sauvegarder dans la base de données
  }

  private async deleteRemindersByEvent(eventId: string): Promise<void> {
    // En production, supprimer de la base de données
  }
}

export const eventManagementService = EventManagementService.getInstance()
