import { NextRequest, NextResponse } from 'next/server'
import { generateBookingReportPDF } from '@/lib/reports'

/**
 * Route API pour générer un rapport PDF de réservation
 * GET /api/admin/reports/booking/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    const buffer = await generateBookingReportPDF(bookingId)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reservation-${bookingId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la génération du rapport PDF:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la génération du rapport PDF' },
      { status: 500 }
    )
  }
}
