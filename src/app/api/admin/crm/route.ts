import { NextRequest, NextResponse } from 'next/server'
import { syncCustomerToCRM, getCustomerCRMData, getVIPCustomers, getInactiveCustomers, segmentCustomers, exportCRMData } from '@/lib/crm'

/**
 * Route API pour synchroniser un client avec le CRM (admin)
 * POST /api/admin/crm/sync
 */
export async function POST_SYNC(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      )
    }

    const crmData = await syncCustomerToCRM(userId)

    return NextResponse.json(crmData, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la synchronisation CRM:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la synchronisation CRM' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les données CRM d'un client (admin)
 * GET /api/admin/crm?userId=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (userId) {
      const crmData = await getCustomerCRMData(userId)
      return NextResponse.json(crmData, { status: 200 })
    }

    return NextResponse.json(
      { error: 'userId requis' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des données CRM:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des données CRM' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les clients VIP (admin)
 * GET /api/admin/crm/vip
 */
export async function GET_VIP() {
  try {
    const vipCustomers = await getVIPCustomers()

    return NextResponse.json(vipCustomers, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des clients VIP:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des clients VIP' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les clients inactifs (admin)
 * GET /api/admin/crm/inactive
 */
export async function GET_INACTIVE() {
  try {
    const inactiveCustomers = await getInactiveCustomers()

    return NextResponse.json(inactiveCustomers, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des clients inactifs:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des clients inactifs' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour segmenter les clients (admin)
 * GET /api/admin/crm/segments
 */
export async function GET_SEGMENTS() {
  try {
    const segments = await segmentCustomers()

    return NextResponse.json(segments, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la segmentation des clients:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la segmentation des clients' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour exporter les données CRM en CSV (admin)
 * GET /api/admin/crm/export
 */
export async function GET_EXPORT() {
  try {
    const csvContent = await exportCRMData()

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=crm_data.csv',
      },
    })
  } catch (error) {
    console.error('Erreur lors de l&apos;export CRM:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l&apos;export CRM' },
      { status: 500 }
    )
  }
}
