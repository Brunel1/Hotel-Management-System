import { NextRequest, NextResponse } from 'next/server'
import { createHousekeepingRecord, getHousekeepingRecords, updateHousekeepingRecord } from '@/lib/maintenance'
import { z } from 'zod'

// Schéma de validation pour la création d'enregistrement de ménage
const housekeepingRecordSchema = z.object({
  roomId: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
})

/**
 * Route API pour créer un enregistrement de ménage (admin)
 * POST /api/admin/housekeeping
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = housekeepingRecordSchema.parse(body)

    // Créer l'enregistrement
    const record = await createHousekeepingRecord({
      roomId: validatedData.roomId,
      status: validatedData.status,
      notes: validatedData.notes,
      assignedToId: validatedData.assignedToId,
    })

    return NextResponse.json(
      { message: 'Enregistrement de ménage créé avec succès', record },
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
    console.error('Erreur lors de la création de l&apos;enregistrement de ménage:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l&apos;enregistrement de ménage' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour récupérer les enregistrements de ménage (admin)
 * GET /api/admin/housekeeping?roomId=&status=&date=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const filters: any = {}
    if (roomId) filters.roomId = roomId
    if (status) filters.status = status
    if (date) filters.date = new Date(date)

    const records = await getHousekeepingRecords(filters)

    return NextResponse.json(records, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des enregistrements de ménage:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des enregistrements de ménage' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour un enregistrement de ménage (admin)
 * PATCH /api/admin/housekeeping
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (data.status) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId

    const record = await updateHousekeepingRecord(id, updateData)

    return NextResponse.json(record, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l&apos;enregistrement de ménage:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l&apos;enregistrement de ménage' },
      { status: 500 }
    )
  }
}
