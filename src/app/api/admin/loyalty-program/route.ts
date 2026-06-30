import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 400 })
    }

    // Récupérer les points de fidélité de l'utilisateur (simulé)
    const loyaltyData = {
      currentLevel: 'SILVER',
      points: 2500,
      nextLevel: 'GOLD',
      pointsToNextLevel: 2500,
      totalPoints: 5000,
      benefits: [
        { level: 'BRONZE', points: 0, benefits: ['Check-in accéléré', 'WiFi gratuit'] },
        { level: 'SILVER', points: 1000, benefits: ['Check-in accéléré', 'WiFi gratuit', 'Petit-déjeuner -10%'] },
        { level: 'GOLD', points: 5000, benefits: ['Check-in accéléré', 'WiFi gratuit', 'Petit-déjeuner gratuit', 'Upgrade chambre'] },
        { level: 'PLATINUM', points: 10000, benefits: ['Check-in accéléré', 'WiFi gratuit', 'Petit-déjeuner gratuit', 'Upgrade suite', 'Lounge accès'] },
      ],
      rewards: [
        { id: '1', name: 'Nuit gratuite', points: 5000, available: true },
        { id: '2', name: 'Dîner au restaurant', points: 2000, available: true },
        { id: '3', name: 'Spa treatment', points: 1500, available: true },
      ],
      history: [
        { id: '1', type: 'earned', points: 500, date: '2024-06-01', description: 'Réservation chambre' },
        { id: '2', type: 'redeemed', points: -2000, date: '2024-05-15', description: 'Dîner au restaurant' },
        { id: '3', type: 'earned', points: 1000, date: '2024-05-01', description: 'Bonus inscription' },
      ],
    }

    return NextResponse.json(loyaltyData)
  } catch (error) {
    console.error('Erreur lors de la récupération du programme de fidélité:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
