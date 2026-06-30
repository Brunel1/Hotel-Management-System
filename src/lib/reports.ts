import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import { prisma } from '@/lib/prisma'

/**
 * Service de génération de rapports et export Excel/PDF
 */

/**
 * Générer un rapport de réservations en Excel
 */
export async function generateBookingsReportExcel(filters?: {
  startDate?: Date
  endDate?: Date
  status?: string
}) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Réservations')

  // Définir les colonnes
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 30 },
    { header: 'Client', key: 'client', width: 30 },
    { header: 'Chambre', key: 'room', width: 15 },
    { header: 'Date d&apos;arrivée', key: 'checkIn', width: 20 },
    { header: 'Date de départ', key: 'checkOut', width: 20 },
    { header: 'Adultes', key: 'adults', width: 10 },
    { header: 'Enfants', key: 'children', width: 10 },
    { header: 'Prix total', key: 'totalPrice', width: 15 },
    { header: 'Statut', key: 'status', width: 15 },
    { header: 'Date de création', key: 'createdAt', width: 20 },
  ]

  // Récupérer les réservations
  const where: any = {}
  if (filters?.startDate) {
    where.checkIn = { ...where.checkIn, gte: filters.startDate }
  }
  if (filters?.endDate) {
    where.checkOut = { ...where.checkOut, lte: filters.endDate }
  }
  if (filters?.status) {
    where.status = filters.status
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      room: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Ajouter les données
  bookings.forEach((booking) => {
    worksheet.addRow({
      id: booking.id,
      client: `${booking.user.profile?.firstName} ${booking.user.profile?.lastName}`,
      room: booking.room.number,
      checkIn: booking.checkIn.toLocaleDateString('fr-FR'),
      checkOut: booking.checkOut.toLocaleDateString('fr-FR'),
      adults: booking.adults,
      children: booking.children,
      totalPrice: `${Number(booking.totalPrice).toFixed(2)}€`,
      status: booking.status,
      createdAt: booking.createdAt.toLocaleDateString('fr-FR'),
    })
  })

  // Générer le buffer
  const buffer = await workbook.xlsx.writeBuffer()

  return buffer
}

/**
 * Générer un rapport de revenus en Excel
 */
export async function generateRevenueReportExcel(startDate: Date, endDate: Date) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Revenus')

  // Définir les colonnes
  worksheet.columns = [
    { header: 'Mois', key: 'month', width: 20 },
    { header: 'Nombre de réservations', key: 'count', width: 20 },
    { header: 'Revenu total', key: 'revenue', width: 20 },
    { header: 'Prix moyen', key: 'average', width: 20 },
  ]

  // Récupérer les données mensuelles
  const bookings = await prisma.booking.findMany({
    where: {
      checkIn: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'],
      },
    },
    orderBy: { checkIn: 'asc' },
  })

  // Grouper par mois
  const monthlyData = new Map<string, { count: number; revenue: number }>()

  bookings.forEach((booking) => {
    const month = booking.checkIn.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
    const data = monthlyData.get(month) || { count: 0, revenue: 0 }
    data.count++
    data.revenue += Number(booking.totalPrice)
    monthlyData.set(month, data)
  })

  // Ajouter les données
  monthlyData.forEach((data, month) => {
    worksheet.addRow({
      month,
      count: data.count,
      revenue: `${data.revenue.toFixed(2)}€`,
      average: `${(data.revenue / data.count).toFixed(2)}€`,
    })
  })

  // Générer le buffer
  const buffer = await workbook.xlsx.writeBuffer()

  return buffer
}

/**
 * Générer un rapport d'occupation en Excel
 */
export async function generateOccupancyReportExcel(startDate: Date, endDate: Date) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Occupation')

  // Définir les colonnes
  worksheet.columns = [
    { header: 'Chambre', key: 'room', width: 15 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Capacité', key: 'capacity', width: 10 },
    { header: 'Nuits réservées', key: 'nights', width: 15 },
    { header: 'Taux d&apos;occupation', key: 'occupancy', width: 20 },
  ]

  // Récupérer toutes les chambres
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
  })

  // Calculer l'occupation pour chaque chambre
  const totalNights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  for (const room of rooms) {
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: room.id,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'],
        },
        OR: [
          {
            checkIn: { lte: startDate },
            checkOut: { gte: startDate },
          },
          {
            checkIn: { lte: endDate },
            checkOut: { gte: endDate },
          },
          {
            checkIn: { gte: startDate },
            checkOut: { lte: endDate },
          },
        ],
      },
    })

    let bookedNights = 0
    bookings.forEach((booking) => {
      const overlapStart = new Date(Math.max(booking.checkIn.getTime(), startDate.getTime()))
      const overlapEnd = new Date(Math.min(booking.checkOut.getTime(), endDate.getTime()))
      bookedNights += Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
    })

    const occupancyRate = (bookedNights / totalNights) * 100

    worksheet.addRow({
      room: room.number,
      type: room.type,
      capacity: room.capacity,
      nights: bookedNights,
      occupancy: `${occupancyRate.toFixed(2)}%`,
    })
  }

  // Générer le buffer
  const buffer = await workbook.xlsx.writeBuffer()

  return buffer
}

/**
 * Générer un rapport PDF de réservation
 */
export async function generateBookingReportPDF(bookingId: string): Promise<Buffer> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      room: true,
      bookingSupplements: {
        include: {
          supplement: true,
        },
      },
    },
  })

  if (!booking) {
    throw new Error('Réservation non trouvée')
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument()
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Contenu du PDF
    doc.fontSize(20).text('Confirmation de Réservation', { align: 'center' })
    doc.moveDown()

    doc.fontSize(12).text(`Numéro de réservation: ${booking.id}`)
    doc.text(`Date de création: ${booking.createdAt.toLocaleDateString('fr-FR')}`)
    doc.moveDown()

    doc.fontSize(14).text('Informations du client', { underline: true })
    doc.fontSize(12).text(`Nom: ${booking.user.profile?.firstName} ${booking.user.profile?.lastName}`)
    doc.text(`Email: ${booking.user.email}`)
    doc.moveDown()

    doc.fontSize(14).text('Informations de la réservation', { underline: true })
    doc.fontSize(12).text(`Chambre: ${booking.room.number} (${booking.room.type})`)
    doc.text(`Date d&apos;arrivée: ${booking.checkIn.toLocaleDateString('fr-FR')}`)
    doc.text(`Date de départ: ${booking.checkOut.toLocaleDateString('fr-FR')}`)
    doc.text(`Adultes: ${booking.adults}`)
    doc.text(`Enfants: ${booking.children}`)
    doc.moveDown()

    doc.fontSize(14).text('Suppléments', { underline: true })
    if (booking.bookingSupplements.length > 0) {
      booking.bookingSupplements.forEach((bs) => {
        doc.fontSize(12).text(`${bs.supplement.name}: ${bs.quantity}x - ${Number(bs.totalPrice).toFixed(2)}€`)
      })
    } else {
      doc.fontSize(12).text('Aucun supplément')
    }
    doc.moveDown()

    doc.fontSize(14).text('Prix total', { underline: true })
    doc.fontSize(16).text(`${Number(booking.totalPrice).toFixed(2)}€`, { align: 'right' })
    doc.moveDown()

    doc.fontSize(10).text('Merci pour votre réservation!', { align: 'center' })

    doc.end()
  })
}
