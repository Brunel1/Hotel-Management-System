import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuditLogs } from '@/lib/audit'

/**
 * Route API pour récupérer les logs d'audit
 * GET /api/admin/audit-logs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const auditLogs = await getAuditLogs({
      userId: userId || undefined,
      action: action || undefined,
      entity: entity || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })

    return NextResponse.json(auditLogs, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d&apos;audit:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des logs d&apos;audit' },
      { status: 500 }
    )
  }
}
