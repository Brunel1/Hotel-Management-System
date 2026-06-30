import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

/**
 * Service de gestion du check-in/check-out avec QR codes
 */

/**
 * Générer un QR code pour une réservation
 */
export async function generateBookingQRCode(bookingId: string, type: 'checkIn' | 'checkOut'): Promise<string> {
  const qrData = JSON.stringify({
    bookingId,
    type,
    timestamp: new Date().toISOString(),
  })

  const qrCode = await QRCode.toDataURL(qrData)
  return qrCode
}

/**
 * Effectuer le check-in d'une réservation
 */
export async function performCheckIn(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: true,
      user: true,
    },
  })

  if (!booking) {
    throw new Error('Réservation non trouvée')
  }

  if (booking.status !== 'CONFIRMED') {
    throw new Error('La réservation doit être confirmée pour le check-in')
  }

  const now = new Date()
  const checkInDate = new Date(booking.checkIn)
  
  // Vérifier que la date de check-in est aujourd'hui ou dans le passé
  if (now.getTime() < checkInDate.setHours(0, 0, 0, 0)) {
    throw new Error('Le check-in n&apos;est pas encore disponible pour cette date')
  }

  // Générer le QR code de check-out
  const checkOutQRCode = await generateBookingQRCode(bookingId, 'checkOut')

  // Mettre à jour la réservation
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CHECKED_IN',
      checkInTime: now,
      checkOutQRCode,
    },
    include: {
      room: true,
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  })

  return updatedBooking
}

/**
 * Effectuer le check-out d'une réservation
 */
export async function performCheckOut(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: true,
      user: true,
    },
  })

  if (!booking) {
    throw new Error('Réservation non trouvée')
  }

  if (booking.status !== 'CHECKED_IN') {
    throw new Error('La réservation doit être en cours pour le check-out')
  }

  const now = new Date()
  const checkOutDate = new Date(booking.checkOut)
  
  // Vérifier que la date de check-out est aujourd'hui ou dans le passé
  if (now.getTime() < checkOutDate.setHours(0, 0, 0, 0)) {
    throw new Error('Le check-out n&apos;est pas encore disponible pour cette date')
  }

  // Mettre à jour la réservation
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CHECKED_OUT',
      checkOutTime: now,
    },
    include: {
      room: true,
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  })

  return updatedBooking
}

/**
 * Générer les QR codes pour une nouvelle réservation
 */
export async function generateBookingQRCodes(bookingId: string) {
  const checkInQRCode = await generateBookingQRCode(bookingId, 'checkIn')
  const checkOutQRCode = await generateBookingQRCode(bookingId, 'checkOut')

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      checkInQRCode,
      checkOutQRCode,
    },
  })

  return { checkInQRCode, checkOutQRCode }
}

/**
 * Vérifier un QR code de check-in/check-out
 */
export async function verifyQRCode(qrData: string): Promise<{ valid: boolean; bookingId?: string; type?: string }> {
  try {
    const data = JSON.parse(qrData)
    
    if (!data.bookingId || !data.type) {
      return { valid: false }
    }

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
    })

    if (!booking) {
      return { valid: false }
    }

    return {
      valid: true,
      bookingId: data.bookingId,
      type: data.type,
    }
  } catch {
    return { valid: false }
  }
}
