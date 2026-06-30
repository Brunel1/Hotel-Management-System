import { NextRequest, NextResponse } from 'next/server'
import { loyaltyService } from '@/lib/loyalty-service'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour les groupes familiaux
 * POST /api/loyalty/family-groups - Créer un groupe familial
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()
    const { name, memberIds } = body

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: 'Nom et membres requis' },
        { status: 400 }
      )
    }

    const group = await loyaltyService.createFamilyGroup(userId, name, memberIds)

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du groupe familial:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du groupe familial' },
      { status: 500 }
    )
  }
}
