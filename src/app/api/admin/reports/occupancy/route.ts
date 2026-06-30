import { NextRequest, NextResponse } from 'next/server'
import { generateOccupancyReportExcel } from '@/lib/reports'

/**
 * Route API pour générer un rapport d'occupation en Excel
 * GET /api/admin/reports/occupancy?startDate=&endDate=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate et endDate requis' },
        { status: 400 }
      )
    }

    const buffer = await generateOccupancyReportExcel(
      new Date(startDate),
      new Date(endDate)
    )

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="occupation.xlsx"',
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
