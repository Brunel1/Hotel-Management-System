import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const rooms = [
      {
        number: '101',
        type: 'STANDARD',
        capacity: 2,
        pricePerNight: 450000, // 89.99 EUR * 5000 = 449950 MGA
        floor: 1,
        description: 'Chambre standard confortable avec vue sur le jardin',
        images: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        isActive: true,
      },
      {
        number: '102',
        type: 'STANDARD',
        capacity: 2,
        pricePerNight: 450000,
        floor: 1,
        description: 'Chambre standard avec lit double et salle de bain privée',
        images: 'https://images.unsplash.com/photo-1590490360182-f33fb0d368c7?w=800',
        isActive: true,
      },
      {
        number: '201',
        type: 'SUPERIOR',
        capacity: 2,
        pricePerNight: 650000, // 129.99 EUR * 5000 = 649950 MGA
        floor: 2,
        description: 'Chambre supérieure avec balcon et vue sur la ville',
        images: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        isActive: true,
      },
      {
        number: '301',
        type: 'SUITE',
        capacity: 4,
        pricePerNight: 1000000, // 199.99 EUR * 5000 = 999950 MGA
        floor: 3,
        description: 'Suite spacieuse avec salon séparé et vue panoramique',
        images: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
        isActive: true,
      },
      {
        number: '302',
        type: 'DELUXE',
        capacity: 3,
        pricePerNight: 800000, // 159.99 EUR * 5000 = 799950 MGA
        floor: 3,
        description: 'Chambre deluxe avec équipements premium et jacuzzi',
        images: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
        isActive: true,
      },
      {
        number: '401',
        type: 'FAMILY',
        capacity: 6,
        pricePerNight: 1250000, // 249.99 EUR * 5000 = 1249950 MGA
        floor: 4,
        description: 'Chambre familiale avec deux lits et espace de jeux',
        images: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        isActive: true,
      },
    ]

    // Supprimer les chambres existantes
    await prisma.room.deleteMany({})

    // Créer les nouvelles chambres
    for (const room of rooms) {
      await prisma.room.create({ data: room })
    }

    return NextResponse.json({ message: 'Chambres de démonstration créées avec succès', count: rooms.length })
  } catch (error) {
    console.error('Erreur lors de la création des chambres:', error)
    return NextResponse.json({ error: 'Erreur lors de la création des chambres' }, { status: 500 })
  }
}
