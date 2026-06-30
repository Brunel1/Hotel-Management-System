import { NextRequest, NextResponse } from 'next/server'
import { createDatabaseBackup, listBackups, deleteBackup } from '@/lib/backup'

/**
 * Route API pour créer une sauvegarde de la base de données
 * POST /api/admin/backups
 */
export async function POST(request: NextRequest) {
  try {
    const result = await createDatabaseBackup()

    if (result.success) {
      return NextResponse.json(
        { message: 'Sauvegarde créée avec succès', filePath: result.filePath },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la sauvegarde' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour lister toutes les sauvegardes
 * GET /api/admin/backups
 */
export async function GET() {
  try {
    const backups = await listBackups()
    return NextResponse.json(backups, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la liste des sauvegardes:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la liste des sauvegardes' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer une sauvegarde
 * DELETE /api/admin/backups?fileName=
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json(
        { error: 'Nom de fichier requis' },
        { status: 400 }
      )
    }

    const result = await deleteBackup(fileName)

    if (result.success) {
      return NextResponse.json(
        { message: 'Sauvegarde supprimée avec succès' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la sauvegarde:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la sauvegarde' },
      { status: 500 }
    )
  }
}
