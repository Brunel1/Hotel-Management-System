import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour la personnalisation de l'interface
 * GET /api/user/customization - Obtenir les paramètres de personnalisation
 * POST /api/user/customization - Sauvegarder les paramètres de personnalisation
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)

    const { prisma } = await import('@/lib/prisma')

    const customization = await prisma.userCustomization.findUnique({
      where: { userId },
    })

    if (!customization) {
      // Retourner les paramètres par défaut
      return NextResponse.json({
        widgets: [
          { id: 'w1', name: 'Statistiques', type: 'analytics', size: 'medium', position: { x: 0, y: 0 }, enabled: true },
          { id: 'w2', name: 'Réservations récentes', type: 'bookings', size: 'large', position: { x: 1, y: 0 }, enabled: true },
          { id: 'w3', name: 'Disponibilité des chambres', type: 'rooms', size: 'medium', position: { x: 0, y: 1 }, enabled: true },
          { id: 'w4', name: 'Services', type: 'services', size: 'small', position: { x: 1, y: 1 }, enabled: false },
          { id: 'w5', name: 'Notifications', type: 'notifications', size: 'small', position: { x: 2, y: 1 }, enabled: true },
        ],
        shortcuts: [
          { id: 's1', name: 'Réservations', url: '/bookings', icon: '📅', order: 0 },
          { id: 's2', name: 'Chambres', url: '/rooms', icon: '🏨', order: 1 },
          { id: 's3', name: 'Clients', url: '/customers', icon: '👥', order: 2 },
        ],
        layout: {
          sidebarCollapsed: false,
          density: 'comfortable',
          fontSize: 'medium',
        },
      }, { status: 200 })
    }

    return NextResponse.json(customization.settings, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de personnalisation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des paramètres de personnalisation' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    const { prisma } = await import('@/lib/prisma')

    const customization = await prisma.userCustomization.upsert({
      where: { userId },
      create: {
        userId,
        settings: body,
      },
      update: {
        settings: body,
      },
    })

    return NextResponse.json(customization.settings, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres de personnalisation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la sauvegarde des paramètres de personnalisation' },
      { status: 500 }
    )
  }
}
