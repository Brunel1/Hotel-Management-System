import { NextRequest, NextResponse } from 'next/server'
import { generateBookingsReportExcel } from '@/lib/reports'

/**
 * Route API pour générer un rapport de réservations en Excel
 * GET /api/admin/reports/bookings?startDate=&endDate=&status=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    const filters: any = {}
    if (startDate) {
      filters.startDate = new Date(startDate)
    }
    if (endDate) {
      filters.endDate = new Date(endDate)
    }
    if (status) {
      filters.status = status
    }

    const buffer = await generateBookingsReportExcel(filters)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="reservations.xlsx"',
      },
    })
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la génération du rapport' },
      { status: 500 }
    )
  }
}
