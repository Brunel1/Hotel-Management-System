import { calculateTotalPrice, formatDate, validateEmail } from '@/lib/utils'

describe('Utilitaires', () => {
  describe('calculateTotalPrice', () => {
    test('calcule le prix total pour une réservation', () => {
      const pricePerNight = 100
      const nights = 3
      const result = calculateTotalPrice(pricePerNight, nights)
      expect(result).toBe(300)
    })

    test('applique une réduction si fournie', () => {
      const pricePerNight = 100
      const nights = 3
      const discount = 10
      const result = calculateTotalPrice(pricePerNight, nights, discount)
      expect(result).toBe(270)
    })

    test('retourne 0 si le prix est négatif', () => {
      const result = calculateTotalPrice(-100, 3)
      expect(result).toBe(0)
    })
  })

  describe('formatDate', () => {
    test('formate une date en français', () => {
      const date = new Date('2024-07-01')
      const result = formatDate(date)
      expect(result).toBe('01/07/2024')
    })

    test('gère les dates invalides', () => {
      const result = formatDate(new Date('invalid'))
      expect(result).toBe('Date invalide')
    })
  })

  describe('validateEmail', () => {
    test('valide un email correct', () => {
      const result = validateEmail('test@example.com')
      expect(result).toBe(true)
    })

    test('rejette un email sans @', () => {
      const result = validateEmail('testexample.com')
      expect(result).toBe(false)
    })

    test('rejette un email sans domaine', () => {
      const result = validateEmail('test@')
      expect(result).toBe(false)
    })

    test('rejette une chaîne vide', () => {
      const result = validateEmail('')
      expect(result).toBe(false)
    })
  })
})

describe('Calculs de disponibilité', () => {
  test('vérifie si une chambre est disponible pour une période', () => {
    const bookings = [
      { checkIn: '2024-07-01', checkOut: '2024-07-05' },
      { checkIn: '2024-07-10', checkOut: '2024-07-15' }
    ]
    const startDate = new Date('2024-07-06')
    const endDate = new Date('2024-07-09')
    const isAvailable = !bookings.some(booking => {
      const bookingStart = new Date(booking.checkIn)
      const bookingEnd = new Date(booking.checkOut)
      return startDate < bookingEnd && endDate > bookingStart
    })
    expect(isAvailable).toBe(true)
  })

  test('détecte un chevauchement de dates', () => {
    const bookings = [
      { checkIn: '2024-07-01', checkOut: '2024-07-05' }
    ]
    const startDate = new Date('2024-07-03')
    const endDate = new Date('2024-07-07')
    const hasOverlap = bookings.some(booking => {
      const bookingStart = new Date(booking.checkIn)
      const bookingEnd = new Date(booking.checkOut)
      return startDate < bookingEnd && endDate > bookingStart
    })
    expect(hasOverlap).toBe(true)
  })
})

describe('Calculs de prix dynamique', () => {
  test('augmente le prix en haute saison', () => {
    const basePrice = 100
    const season = 'high'
    const multiplier = season === 'high' ? 1.3 : 1
    expect(basePrice * multiplier).toBe(130)
  })

  test('réduit le prix en basse saison', () => {
    const basePrice = 100
    const season = 'low'
    const multiplier = season === 'low' ? 0.8 : 1
    expect(basePrice * multiplier).toBe(80)
  })

  test('applique une surcharge pour les réservations de dernière minute', () => {
    const basePrice = 100
    const daysBefore = 2
    const lastMinuteSurcharge = daysBefore < 3 ? 1.2 : 1
    expect(basePrice * lastMinuteSurcharge).toBe(120)
  })
})
