import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId, requireEditorOrAdmin } from '@/lib/permissions'
import { z } from 'zod'

// Schéma de validation pour la création de facture
const createInvoiceSchema = z.object({
  bookingId: z.string().min(1, 'L\'ID de la réservation est requis'),
  subtotal: z.number().positive('Le sous-total doit être positif'),
  tax: z.number().min(0, 'La taxe doit être positive ou nulle').default(0),
  dueDate: z.string().datetime('Date d\'échéance invalide'),
  notes: z.string().optional(),
})

/**
 * Route API pour récupérer toutes les factures
 * GET /api/invoices
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const bookingId = searchParams.get('bookingId')

    // Construire le filtre
    const where: Record<string, unknown> = {}

    // Les visiteurs ne voient que leurs propres factures
    if (userRole === 'VISITOR' && userId) {
      where.booking = {
        userId,
      }
    }

    // Les éditeurs et admins peuvent filtrer par statut
    if (status) {
      where.status = status
    }

    if (bookingId) {
      where.bookingId = bookingId
    }

    // Récupérer les factures
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
            room: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json(invoices, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des factures' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour créer une nouvelle facture
 * POST /api/invoices
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier les permissions
    const permissionError = requireEditorOrAdmin(request)
    if (permissionError) return permissionError

    // Parser le corps de la requête
    const body = await request.json()

    // Valider les données
    const validatedData = createInvoiceSchema.parse(body)

    // Vérifier si la réservation existe
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        invoice: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier si une facture existe déjà pour cette réservation
    if (booking.invoice) {
      return NextResponse.json(
        { error: 'Une facture existe déjà pour cette réservation' },
        { status: 400 }
      )
    }

    // Générer un numéro de facture unique
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Calculer le total
    const total = validatedData.subtotal + validatedData.tax

    // Créer la facture
    const invoice = await prisma.invoice.create({
      data: {
        bookingId: validatedData.bookingId,
        invoiceNumber,
        subtotal: validatedData.subtotal,
        tax: validatedData.tax,
        total,
        dueDate: new Date(validatedData.dueDate),
        notes: validatedData.notes,
        status: 'SENT',
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
            room: true,
          },
        },
      },
    })

    return NextResponse.json(
      { message: 'Facture créée avec succès', invoice },
      { status: 201 }
    )
  } catch (error) {
    // Gérer les erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    // Gérer les autres erreurs
    console.error('Erreur lors de la création de la facture:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la facture' },
      { status: 500 }
    )
  }
}
