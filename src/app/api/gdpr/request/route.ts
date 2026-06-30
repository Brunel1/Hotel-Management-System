import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const { type } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'Type de requête requis' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: true,
        reviews: true,
        favorites: true,
        preferences: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    switch (type) {
      case 'access':
        // Créer un enregistrement de la demande d'accès
        await prisma.gDPRRequest.create({
          data: {
            userId,
            type: 'ACCESS',
            status: 'PENDING'
          }
        })
        return NextResponse.json({
          success: true,
          message: 'Votre demande d\'accès à vos données a été enregistrée. Vous recevrez une réponse sous 30 jours.'
        })

      case 'export':
        // Créer un enregistrement de la demande d'export
        await prisma.gDPRRequest.create({
          data: {
            userId,
            type: 'EXPORT',
            status: 'PENDING'
          }
        })
        return NextResponse.json({
          success: true,
          message: 'Votre demande d\'export de données a été enregistrée. Vous recevrez un lien de téléchargement sous 30 jours.'
        })

      case 'rectify':
        // Créer un enregistrement de la demande de rectification
        await prisma.gDPRRequest.create({
          data: {
            userId,
            type: 'RECTIFY',
            status: 'PENDING'
          }
        })
        return NextResponse.json({
          success: true,
          message: 'Votre demande de rectification a été enregistrée. Nous vous contacterons sous 30 jours.'
        })

      case 'delete':
        // Anonymiser les données de l'utilisateur au lieu de supprimer
        await prisma.user.update({
          where: { id: userId },
          data: {
            email: `deleted_${userId}@anonymous.local`,
            name: 'Utilisateur supprimé',
            phone: null,
            address: null
          }
        })

        // Créer un enregistrement de la demande de suppression
        await prisma.gDPRRequest.create({
          data: {
            userId,
            type: 'DELETE',
            status: 'COMPLETED'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Vos données ont été anonymisées avec succès.'
        })

      default:
        return NextResponse.json(
          { error: 'Type de requête invalide' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête GDPR:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande' },
      { status: 500 }
    )
  }
}
