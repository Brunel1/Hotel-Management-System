import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const sampleRooms = [
  {
    number: '101',
    type: 'STANDARD' as const,
    capacity: 2,
    pricePerNight: 80,
    floor: 1,
    description: 'Chambre standard confortable avec vue sur le jardin. Idéale pour les séjours courts.',
    images: [],
    isActive: true,
  },
  {
    number: '102',
    type: 'STANDARD' as const,
    capacity: 2,
    pricePerNight: 85,
    floor: 1,
    description: 'Chambre standard spacieuse avec balcon. Parfaite pour les couples.',
    images: [],
    isActive: true,
  },
  {
    number: '201',
    type: 'SUPERIOR' as const,
    capacity: 2,
    pricePerNight: 120,
    floor: 2,
    description: 'Chambre supérieure avec vue sur la ville. Équipements modernes et confort optimal.',
    images: [],
    isActive: true,
  },
  {
    number: '202',
    type: 'SUPERIOR' as const,
    capacity: 3,
    pricePerNight: 140,
    floor: 2,
    description: 'Chambre supérieure familiale avec espace de vie séparé.',
    images: [],
    isActive: true,
  },
  {
    number: '301',
    type: 'SUITE' as const,
    capacity: 2,
    pricePerNight: 200,
    floor: 3,
    description: 'Suite luxueuse avec salon séparé et vue panoramique. Expérience premium.',
    images: [],
    isActive: true,
  },
  {
    number: '302',
    type: 'SUITE' as const,
    capacity: 4,
    pricePerNight: 250,
    floor: 3,
    description: 'Suite présidentielle avec deux chambres et salon. Idéale pour les familles.',
    images: [],
    isActive: true,
  },
  {
    number: '401',
    type: 'DELUXE' as const,
    capacity: 2,
    pricePerNight: 180,
    floor: 4,
    description: 'Chambre deluxe avec terrasse privée et jacuzzi. Luxe absolu.',
    images: [],
    isActive: true,
  },
  {
    number: '501',
    type: 'FAMILY' as const,
    capacity: 6,
    pricePerNight: 300,
    floor: 5,
    description: 'Appartement familial avec deux chambres, cuisine et salon. Parfait pour les longs séjours.',
    images: [],
    isActive: true,
  },
]

const sampleAmenities = [
  { name: 'WiFi', icon: 'wifi', description: 'Accès Internet haut débit' },
  { name: 'Climatisation', icon: 'snowflake', description: 'Climatisation individuelle' },
  { name: 'Télévision', icon: 'tv', description: 'Télévision écran plat' },
  { name: 'Minibar', icon: 'wine', description: 'Minibar équipé' },
  { name: 'Coffre-fort', icon: 'lock', description: 'Coffre-fort numérique' },
]

export async function POST(request: NextRequest) {
  try {
    // Créer les équipements
    const amenities = await Promise.all(
      sampleAmenities.map((amenity) =>
        prisma.amenity.upsert({
          where: { name: amenity.name },
          update: {},
          create: amenity,
        })
      )
    )

    // Créer les chambres
    const createdRooms = []
    for (const roomData of sampleRooms) {
      const room = await prisma.room.upsert({
        where: { number: roomData.number },
        update: {},
        create: {
          ...roomData,
          amenities: {
            create: amenities.map((amenity) => ({
              amenityId: amenity.id,
            })),
          },
        },
      })
      createdRooms.push(room)
    }

    return NextResponse.json(
      {
        message: 'Données de démonstration créées avec succès',
        rooms: createdRooms.length,
        amenities: amenities.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors du seeding:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du seeding' },
      { status: 500 }
    )
  }
}
