const fetch = require('node-fetch')

const rooms = [
  {
    number: '101',
    type: 'STANDARD',
    capacity: 2,
    pricePerNight: 80,
    floor: 1,
    description: 'Chambre standard confortable avec vue sur le jardin. Idéale pour les séjours courts.',
    images: [],
  },
  {
    number: '102',
    type: 'STANDARD',
    capacity: 2,
    pricePerNight: 85,
    floor: 1,
    description: 'Chambre standard spacieuse avec balcon. Parfaite pour les couples.',
    images: [],
  },
  {
    number: '201',
    type: 'SUPERIOR',
    capacity: 2,
    pricePerNight: 120,
    floor: 2,
    description: 'Chambre supérieure avec vue sur la ville. Équipements modernes et confort optimal.',
    images: [],
  },
  {
    number: '202',
    type: 'SUPERIOR',
    capacity: 3,
    pricePerNight: 140,
    floor: 2,
    description: 'Chambre supérieure familiale avec espace de vie séparé.',
    images: [],
  },
  {
    number: '301',
    type: 'SUITE',
    capacity: 2,
    pricePerNight: 200,
    floor: 3,
    description: 'Suite luxueuse avec salon séparé et vue panoramique. Expérience premium.',
    images: [],
  },
  {
    number: '302',
    type: 'SUITE',
    capacity: 4,
    pricePerNight: 250,
    floor: 3,
    description: 'Suite présidentielle avec deux chambres et salon. Idéale pour les familles.',
    images: [],
  },
  {
    number: '401',
    type: 'DELUXE',
    capacity: 2,
    pricePerNight: 180,
    floor: 4,
    description: 'Chambre deluxe avec terrasse privée et jacuzzi. Luxe absolu.',
    images: [],
  },
  {
    number: '501',
    type: 'FAMILY',
    capacity: 6,
    pricePerNight: 300,
    floor: 5,
    description: 'Appartement familial avec deux chambres, cuisine et salon. Parfait pour les longs séjours.',
    images: [],
  },
]

async function seedRooms() {
  console.log('Création des chambres via API...')
  
  for (const room of rooms) {
    try {
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
      })
      
      if (response.ok) {
        console.log(`✓ Chambre ${room.number} créée avec succès`)
      } else {
        const error = await response.json()
        console.log(`✗ Erreur pour chambre ${room.number}:`, error.error)
      }
    } catch (error) {
      console.log(`✗ Erreur pour chambre ${room.number}:`, error.message)
    }
  }
  
  console.log('Terminé!')
}

seedRooms()
