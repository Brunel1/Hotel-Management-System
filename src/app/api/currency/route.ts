import { NextRequest, NextResponse } from 'next/server'
import { convertCurrency, formatCurrency, getAvailableCurrencies, getExchangeRates } from '@/lib/currency'

/**
 * Route API pour convertir un montant d'une devise à une autre
 * GET /api/currency?amount=&from=&to=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const amount = searchParams.get('amount')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const list = searchParams.get('list')

    // Lister les devises disponibles
    if (list === 'true') {
      return NextResponse.json({
        currencies: getAvailableCurrencies(),
        rates: getExchangeRates(),
      })
    }

    // Convertir un montant
    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: 'amount, from et to requis' },
        { status: 400 }
      )
    }

    const amountNum = parseFloat(amount)
    const convertedAmount = convertCurrency(amountNum, from, to)
    const formattedAmount = formatCurrency(convertedAmount, to)

    return NextResponse.json({
      original: formatCurrency(amountNum, from),
      converted: formattedAmount,
      amount: convertedAmount,
      from,
      to,
    })
  } catch (error) {
    console.error('Erreur lors de la conversion de devise:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la conversion de devise' },
      { status: 500 }
    )
  }
}
