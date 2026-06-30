import { NextRequest, NextResponse } from 'next/server'
import { convertTimezone, formatDateInTimezone, formatDateTimeInTimezone, getUserTimezone, getCommonTimezones } from '@/lib/timezone'

/**
 * Route API pour la gestion des fuseaux horaires
 * GET /api/timezone?date=&from=&to=&format=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const format = searchParams.get('format')
    const list = searchParams.get('list')

    // Lister les fuseaux horaires courants
    if (list === 'true') {
      return NextResponse.json({
        timezones: getCommonTimezones(),
        userTimezone: getUserTimezone(),
      })
    }

    // Convertir une date
    if (!date || !from || !to) {
      return NextResponse.json(
        { error: 'date, from et to requis' },
        { status: 400 }
      )
    }

    const dateObj = new Date(date)
    const convertedDate = convertTimezone(dateObj, from, to)

    let result: any = {
      original: date,
      converted: convertedDate.toISOString(),
      from,
      to,
    }

    if (format === 'date') {
      result.formatted = formatDateInTimezone(convertedDate, to)
    } else if (format === 'datetime') {
      result.formatted = formatDateTimeInTimezone(convertedDate, to)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur lors de la conversion de fuseau horaire:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la conversion de fuseau horaire' },
      { status: 500 }
    )
  }
}
