import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Début du seeding de la base de données...')

  // Créer un compte admin par défaut
  const adminEmail = 'admin@hotel.mg'
  const adminPassword = 'Admin123!'

  // Créer ou récupérer le rôle ADMIN
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrateur avec accès complet',
      permissions: JSON.stringify(['ALL']),
    },
  })

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword)
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        isActive: true,
        twoFactorBackupCodes: '',
        roleId: adminRole.id,
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'Hotel',
            phone: '+261 34 00 000 00',
            address: '123 Rue de l\'Hôtel',
            city: 'Mahajanga',
            country: 'Madagascar',
            postalCode: '401',
            allergies: '',
          },
        },
      },
    })
    console.log('Compte admin créé:', admin.email)
    console.log('Mot de passe admin:', adminPassword)
  } else {
    console.log('Compte admin existe déjà:', existingAdmin.email)
  }

  // Créer des équipements
  const amenities = await Promise.all([
    prisma.amenity.upsert({
      where: { name: 'WiFi' },
      update: {},
      create: {
        name: 'WiFi',
        icon: 'wifi',
        description: 'Accès Internet haut débit',
      },
    }),
    prisma.amenity.upsert({
      where: { name: 'Climatisation' },
      update: {},
      create: {
        name: 'Climatisation',
        icon: 'snowflake',
        description: 'Climatisation individuelle',
      },
    }),
    prisma.amenity.upsert({
      where: { name: 'Télévision' },
      update: {},
      create: {
        name: 'Télévision',
        icon: 'tv',
        description: 'Télévision écran plat',
      },
    }),
    prisma.amenity.upsert({
      where: { name: 'Minibar' },
      update: {},
      create: {
        name: 'Minibar',
        icon: 'wine',
        description: 'Minibar équipé',
      },
    }),
    prisma.amenity.upsert({
      where: { name: 'Coffre-fort' },
      update: {},
      create: {
        name: 'Coffre-fort',
        icon: 'lock',
        description: 'Coffre-fort numérique',
      },
    }),
  ])

  console.log('Équipements créés:', amenities.length)

  // Créer des chambres
  const rooms = [
    {
      number: '101',
      type: 'STANDARD' as const,
      capacity: 2,
      pricePerNight: 80,
      floor: 1,
      description: 'Chambre standard confortable avec vue sur le jardin. Idéale pour les séjours courts.',
      images: '[]',
      isActive: true,
    },
    {
      number: '102',
      type: 'STANDARD' as const,
      capacity: 2,
      pricePerNight: 85,
      floor: 1,
      description: 'Chambre standard spacieuse avec balcon. Parfaite pour les couples.',
      images: '[]',
      isActive: true,
    },
    {
      number: '201',
      type: 'SUPERIOR' as const,
      capacity: 2,
      pricePerNight: 120,
      floor: 2,
      description: 'Chambre supérieure avec vue sur la ville. Équipements modernes et confort optimal.',
      images: '[]',
      isActive: true,
    },
    {
      number: '202',
      type: 'SUPERIOR' as const,
      capacity: 3,
      pricePerNight: 140,
      floor: 2,
      description: 'Chambre supérieure familiale avec espace de vie séparé.',
      images: '[]',
      isActive: true,
    },
    {
      number: '301',
      type: 'SUITE' as const,
      capacity: 2,
      pricePerNight: 200,
      floor: 3,
      description: 'Suite luxueuse avec salon séparé et vue panoramique. Expérience premium.',
      images: '[]',
      isActive: true,
    },
    {
      number: '302',
      type: 'SUITE' as const,
      capacity: 4,
      pricePerNight: 250,
      floor: 3,
      description: 'Suite présidentielle avec deux chambres et salon. Idéale pour les familles.',
      images: '[]',
      isActive: true,
    },
    {
      number: '401',
      type: 'DELUXE' as const,
      capacity: 2,
      pricePerNight: 180,
      floor: 4,
      description: 'Chambre deluxe avec terrasse privée et jacuzzi. Luxe absolu.',
      images: '[]',
      isActive: true,
    },
    {
      number: '501',
      type: 'FAMILY' as const,
      capacity: 6,
      pricePerNight: 300,
      floor: 5,
      description: 'Appartement familial avec deux chambres, cuisine et salon. Parfait pour les longs séjours.',
      images: '[]',
      isActive: true,
    },
  ]

  for (const roomData of rooms) {
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
    console.log(`Chambre ${room.number} créée/mise à jour`)
  }

  console.log('Seeding terminé avec succès!')
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
