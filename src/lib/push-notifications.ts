/**
 * Système de notifications push avancé
 * Supporte les notifications personnalisées, géolocalisées et segmentées
 */

export interface PushNotification {
  id: string
  userId?: string
  title: string
  body: string
  icon?: string
  image?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tags?: string[]
  requireInteraction?: boolean
  silent?: boolean
  timestamp: Date
  type: 'booking' | 'promotion' | 'reminder' | 'alert' | 'update' | 'custom'
  priority: 'low' | 'normal' | 'high'
  ttl?: number
  geolocation?: {
    latitude: number
    longitude: number
    radius: number
  }
  segment?: 'guest' | 'staff' | 'admin' | 'all'
}

export interface NotificationPreferences {
  userId: string
  enabled: boolean
  bookingNotifications: boolean
  promotionNotifications: boolean
  reminderNotifications: boolean
  alertNotifications: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:mm
    end: string // HH:mm
  }
  soundEnabled: boolean
  vibrationEnabled: boolean
}

/**
 * Classe de gestion des notifications push
 */
export class PushNotificationService {
  private static instance: PushNotificationService
  private subscriptions: Map<string, PushSubscription> = new Map()
  private preferences: Map<string, NotificationPreferences> = new Map()

  private constructor() {
    this.initializeServiceWorker()
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  /**
   * Initialiser le service worker pour les notifications
   */
  private async initializeServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker enregistré pour les notifications:', registration)
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du Service Worker:', error)
      }
    }
  }

  /**
   * Demander la permission d'envoyer des notifications
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  /**
   * S'abonner aux notifications push
   */
  async subscribe(userId: string): Promise<PushSubscription | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      })

      this.subscriptions.set(userId, subscription)
      return subscription
    } catch (error) {
      console.error('Erreur lors de l\'abonnement aux notifications:', error)
      return null
    }
  }

  /**
   * Se désabonner des notifications push
   */
  async unsubscribe(userId: string): Promise<boolean> {
    const subscription = this.subscriptions.get(userId)
    if (!subscription) return false

    try {
      await subscription.unsubscribe()
      this.subscriptions.delete(userId)
      return true
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error)
      return false
    }
  }

  /**
   * Envoyer une notification locale
   */
  sendLocalNotification(notification: PushNotification): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (Notification.permission !== 'granted') {
      console.warn('Permission de notification non accordée')
      return
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      image: notification.image,
      badge: '/icon-192x192.png',
      tag: notification.tags?.[0],
      requireInteraction: notification.requireInteraction,
      silent: notification.silent,
      data: notification.data,
      actions: notification.actions,
      timestamp: notification.timestamp.getTime(),
    }

    const notif = new Notification(notification.title, options)

    // Gérer les actions de notification
    notif.onclick = (event) => {
      event.preventDefault()
      notif.close()
      // Naviguer vers la page appropriée
      if (notification.data?.url) {
        window.location.href = notification.data.url
      }
    }
  }

  /**
   * Envoyer une notification push via le serveur
   */
  async sendPushNotification(notification: PushNotification): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      })

      return response.ok
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification push:', error)
      return false
    }
  }

  /**
   * Envoyer une notification à un utilisateur spécifique
   */
  async sendToUser(userId: string, notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<boolean> {
    const fullNotification: PushNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId,
    }

    return this.sendPushNotification(fullNotification)
  }

  /**
   * Envoyer une notification à un segment d'utilisateurs
   */
  async sendToSegment(
    segment: 'guest' | 'staff' | 'admin' | 'all',
    notification: Omit<PushNotification, 'id' | 'timestamp' | 'segment'>
  ): Promise<boolean> {
    const fullNotification: PushNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      segment,
    }

    return this.sendPushNotification(fullNotification)
  }

  /**
   * Envoyer une notification géolocalisée
   */
  async sendGeolocatedNotification(
    notification: Omit<PushNotification, 'id' | 'timestamp' | 'geolocation'>
  ): Promise<boolean> {
    const fullNotification: PushNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      geolocation: notification.geolocation,
    }

    return this.sendPushNotification(fullNotification)
  }

  /**
   * Envoyer une notification de réservation
   */
  async sendBookingNotification(
    userId: string,
    type: 'confirmation' | 'reminder' | 'cancellation' | 'checkin' | 'checkout',
    bookingDetails: any
  ): Promise<boolean> {
    const titles = {
      confirmation: 'Réservation confirmée',
      reminder: 'Rappel de réservation',
      cancellation: 'Réservation annulée',
      checkin: 'Check-in disponible',
      checkout: 'Check-out rappel',
    }

    const bodies = {
      confirmation: `Votre réservation pour le ${new Date(bookingDetails.checkIn).toLocaleDateString('fr-FR')} est confirmée.`,
      reminder: `Votre séjour commence demain. Préparez votre check-in.`,
      cancellation: `Votre réservation a été annulée.`,
      checkin: `Votre chambre est prête. Check-in disponible maintenant.`,
      checkout: `N'oubliez pas de faire votre check-out avant 11h.`,
    }

    return this.sendToUser(userId, {
      title: titles[type],
      body: bodies[type],
      type: 'booking',
      priority: type === 'reminder' || type === 'checkout' ? 'high' : 'normal',
      data: {
        bookingId: bookingDetails.id,
        url: `/bookings/${bookingDetails.id}`,
      },
    })
  }

  /**
   * Envoyer une notification promotionnelle
   */
  async sendPromotionNotification(
    segment: 'guest' | 'staff' | 'admin' | 'all',
    promotion: {
      title: string
      description: string
      discount: number
      validUntil: Date
    }
  ): Promise<boolean> {
    return this.sendToSegment(segment, {
      title: promotion.title,
      body: `${promotion.description} -${promotion.discount}% jusqu'au ${new Date(promotion.validUntil).toLocaleDateString('fr-FR')}`,
      type: 'promotion',
      priority: 'normal',
      data: {
        promotionId: promotion.title,
        url: '/promotions',
      },
    })
  }

  /**
   * Envoyer une notification d'alerte
   */
  async sendAlertNotification(
    userId: string,
    alert: {
      title: string
      message: string
      severity: 'low' | 'medium' | 'high' | 'critical'
    }
  ): Promise<boolean> {
    return this.sendToUser(userId, {
      title: alert.title,
      body: alert.message,
      type: 'alert',
      priority: alert.severity === 'critical' || alert.severity === 'high' ? 'high' : 'normal',
      requireInteraction: alert.severity === 'critical',
      data: {
        severity: alert.severity,
        url: '/alerts',
      },
    })
  }

  /**
   * Définir les préférences de notification d'un utilisateur
   */
  setPreferences(preferences: NotificationPreferences): void {
    this.preferences.set(preferences.userId, preferences)
    localStorage.setItem(`notification-preferences-${preferences.userId}`, JSON.stringify(preferences))
  }

  /**
   * Obtenir les préférences de notification d'un utilisateur
   */
  getPreferences(userId: string): NotificationPreferences | null {
    // Essayer d'abord depuis le cache
    if (this.preferences.has(userId)) {
      return this.preferences.get(userId)!
    }

    // Essayer depuis localStorage
    const stored = localStorage.getItem(`notification-preferences-${userId}`)
    if (stored) {
      const preferences = JSON.parse(stored) as NotificationPreferences
      this.preferences.set(userId, preferences)
      return preferences
    }

    // Retourner les préférences par défaut
    const defaultPreferences: NotificationPreferences = {
      userId,
      enabled: true,
      bookingNotifications: true,
      promotionNotifications: true,
      reminderNotifications: true,
      alertNotifications: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      soundEnabled: true,
      vibrationEnabled: true,
    }

    this.preferences.set(userId, defaultPreferences)
    return defaultPreferences
  }

  /**
   * Vérifier si les notifications sont autorisées pour un utilisateur à l'heure actuelle
   */
  canSendNotification(userId: string, type: PushNotification['type']): boolean {
    const preferences = this.getPreferences(userId)
    if (!preferences || !preferences.enabled) return false

    // Vérifier les préférences spécifiques par type
    switch (type) {
      case 'booking':
        if (!preferences.bookingNotifications) return false
        break
      case 'promotion':
        if (!preferences.promotionNotifications) return false
        break
      case 'reminder':
        if (!preferences.reminderNotifications) return false
        break
      case 'alert':
        if (!preferences.alertNotifications) return false
        break
    }

    // Vérifier les heures de calme
    if (preferences.quietHours.enabled) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number)
      const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number)
      const startTime = startHour * 60 + startMin
      const endTime = endHour * 60 + endMin

      if (currentTime >= startTime || currentTime < endTime) {
        return false
      }
    }

    return true
  }

  /**
   * Convertir une chaîne Base64 en Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }
}

export const pushNotificationService = PushNotificationService.getInstance()
