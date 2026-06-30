import { NextRequest, NextResponse } from 'next/server'

// Base de connaissances de l'hôtel
const hotelKnowledge = {
  chambres: {
    standard: {
      description: 'Nos chambres standard offrent tout le confort nécessaire avec un lit double, salle de bain privée, TV écran plat, Wi-Fi gratuit et climatisation.',
      prix: 'à partir de 50€ par nuit',
      capacite: '2 personnes',
      equipements: ['Lit double', 'Salle de bain privée', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Coffre-fort']
    },
    superior: {
      description: 'Les chambres supérieures sont plus spacieuses avec vue sur le jardin ou la ville, minibar et coin travail.',
      prix: 'à partir de 80€ par nuit',
      capacite: '2 personnes',
      equipements: ['Lit double', 'Salle de bain privée', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Minibar', 'Coin travail', 'Vue jardin/ville']
    },
    suite: {
      description: 'Nos suites offrent un espace de vie séparé, balcon privé, baignoire spa et service de chambre inclus.',
      prix: 'à partir de 150€ par nuit',
      capacite: '4 personnes',
      equipements: ['Chambre séparée', 'Salon', 'Balcon privé', 'Baignoire spa', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Minibar', 'Service chambre']
    },
    deluxe: {
      description: 'Les chambres Deluxe sont nos plus belles chambres avec vue mer, terrasse privée et accès VIP.',
      prix: 'à partir de 200€ par nuit',
      capacite: '2 personnes',
      equipements: ['Lit king size', 'Salle de bain luxe', 'Vue mer', 'Terrasse privée', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Accès VIP', 'Robe de chambre']
    },
    family: {
      description: 'Nos chambres familiales sont parfaites pour les familles avec 2 lits séparés et espace enfants.',
      prix: 'à partir de 120€ par nuit',
      capacite: '4 personnes',
      equipements: ['2 lits séparés', 'Salle de bain privée', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Espace enfants', 'Chaise haute']
    }
  },
  services: {
    restaurant: {
      nom: 'Le Gourmet',
      description: 'Notre restaurant propose une cuisine locale et internationale. Ouvert de 7h à 22h.',
      specialites: ['Plats malgaches', 'Fruits de mer', 'Cuisine internationale', 'Petit-déjeuner buffet'],
      horaires: '7h00 - 22h00'
    },
    piscine: {
      description: 'Piscine extérieure chauffée avec vue panoramique. Ouverte de 8h à 20h.',
      horaires: '8h00 - 20h00',
      access: 'Gratuit pour les clients'
    },
    spa: {
      description: 'Notre spa propose massages, soins du visage et traitements thalasso.',
      services: ['Massages', 'Soins du visage', 'Thalasso', 'Sauna', 'Hammam'],
      horaires: '9h00 - 19h00',
      reservation: 'Réservation recommandée'
    },
    parking: {
      description: 'Parking sécurisé disponible 24h/24.',
      prix: 'Gratuit pour les clients',
      capacite: '50 places'
    },
    wifi: {
      description: 'Wi-Fi haut débit gratuit dans tout l\'hôtel.',
      vitesse: '100 Mbps'
    }
  },
  horaires: {
    reception: '24h/24, 7j/7',
    restaurant: '7h00 - 22h00',
    piscine: '8h00 - 20h00',
    spa: '9h00 - 19h00',
    petit_dejeuner: '6h30 - 10h30'
  },
  localisation: {
    adresse: '123 Rue de l\'Hôtel, Mahajanga, Madagascar',
    distance_plage: '5 minutes à pied',
    distance_centre: '10 minutes en voiture',
    distance_aeroport: '20 minutes en voiture'
  },
  reglement: {
    checkin: 'À partir de 14h00',
    checkout: 'Jusqu\'à 11h00',
    annulation: 'Gratuite jusqu\'à 48h avant l\'arrivée',
    animaux: 'Animaux acceptés sur demande (10€/nuit)',
    paiement: 'Cartes bancaires, espèces, virement'
  }
}

// Fonction pour analyser le message et trouver la réponse appropriée
function analyzeMessage(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Salutations
  if (lowerMessage.match(/bonjour|salut|hello|coucou|hey/)) {
    return 'Bonjour ! Je suis votre assistant IA pour l\'hôtel. Comment puis-je vous aider aujourd\'hui ? Je peux vous renseigner sur nos chambres, services, tarifs ou disponibilités.'
  }

  // Chambres
  if (lowerMessage.includes('chambre') || lowerMessage.includes('room')) {
    if (lowerMessage.includes('standard')) {
      return hotelKnowledge.chambres.standard.description + ` Prix : ${hotelKnowledge.chambres.standard.prix}. Capacité : ${hotelKnowledge.chambres.standard.capacite}. Équipements : ${hotelKnowledge.chambres.standard.equipements.join(', ')}.`
    }
    if (lowerMessage.includes('supérieur') || lowerMessage.includes('superior')) {
      return hotelKnowledge.chambres.superior.description + ` Prix : ${hotelKnowledge.chambres.superior.prix}. Capacité : ${hotelKnowledge.chambres.superior.capacite}. Équipements : ${hotelKnowledge.chambres.superior.equipements.join(', ')}.`
    }
    if (lowerMessage.includes('suite')) {
      return hotelKnowledge.chambres.suite.description + ` Prix : ${hotelKnowledge.chambres.suite.prix}. Capacité : ${hotelKnowledge.chambres.suite.capacite}. Équipements : ${hotelKnowledge.chambres.suite.equipements.join(', ')}.`
    }
    if (lowerMessage.includes('deluxe') || lowerMessage.includes('delux')) {
      return hotelKnowledge.chambres.deluxe.description + ` Prix : ${hotelKnowledge.chambres.deluxe.prix}. Capacité : ${hotelKnowledge.chambres.deluxe.capacite}. Équipements : ${hotelKnowledge.chambres.deluxe.equipements.join(', ')}.`
    }
    if (lowerMessage.includes('famille') || lowerMessage.includes('family')) {
      return hotelKnowledge.chambres.family.description + ` Prix : ${hotelKnowledge.chambres.family.prix}. Capacité : ${hotelKnowledge.chambres.family.capacite}. Équipements : ${hotelKnowledge.chambres.family.equipements.join(', ')}.`
    }
    return `Nous proposons plusieurs types de chambres :\n\n• Standard : ${hotelKnowledge.chambres.standard.prix}\n• Supérieure : ${hotelKnowledge.chambres.superior.prix}\n• Suite : ${hotelKnowledge.chambres.suite.prix}\n• Deluxe : ${hotelKnowledge.chambres.deluxe.prix}\n• Familiale : ${hotelKnowledge.chambres.family.prix}\n\nQuel type de chambre vous intéresse ?`
  }

  // Prix / Tarifs
  if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('combien')) {
    return `Nos tarifs varient selon le type de chambre :\n\n• Standard : ${hotelKnowledge.chambres.standard.prix}\n• Supérieure : ${hotelKnowledge.chambres.superior.prix}\n• Suite : ${hotelKnowledge.chambres.suite.prix}\n• Deluxe : ${hotelKnowledge.chambres.deluxe.prix}\n• Familiale : ${hotelKnowledge.chambres.family.prix}\n\nLes prix peuvent varier selon la saison et la disponibilité. Je peux vous aider à vérifier les disponibilités pour vos dates.`
  }

  // Restaurant
  if (lowerMessage.includes('restaurant') || lowerMessage.includes('manger') || lowerMessage.includes('repas')) {
    return `${hotelKnowledge.services.restaurant.nom} : ${hotelKnowledge.services.restaurant.description}\n\nSpécialités : ${hotelKnowledge.services.restaurant.specialites.join(', ')}\nHoraires : ${hotelKnowledge.services.restaurant.horaires}`
  }

  // Piscine
  if (lowerMessage.includes('piscine') || lowerMessage.includes('pool')) {
    return `${hotelKnowledge.services.piscine.description}\nHoraires : ${hotelKnowledge.services.piscine.horaires}\nAccès : ${hotelKnowledge.services.piscine.access}`
  }

  // Spa
  if (lowerMessage.includes('spa') || lowerMessage.includes('massage') || lowerMessage.includes('soin')) {
    return `${hotelKnowledge.services.spa.description}\n\nServices : ${hotelKnowledge.services.spa.services.join(', ')}\nHoraires : ${hotelKnowledge.services.spa.horaires}\n${hotelKnowledge.services.spa.reservation}`
  }

  // Parking
  if (lowerMessage.includes('parking') || lowerMessage.includes('voiture') || lowerMessage.includes('garage')) {
    return `${hotelKnowledge.services.parking.description}\nPrix : ${hotelKnowledge.services.parking.prix}\nCapacité : ${hotelKnowledge.services.parking.capacite}`
  }

  // Wi-Fi
  if (lowerMessage.includes('wifi') || lowerMessage.includes('internet') || lowerMessage.includes('connexion')) {
    return `${hotelKnowledge.services.wifi.description}\nVitesse : ${hotelKnowledge.services.wifi.vitesse}`
  }

  // Horaires
  if (lowerMessage.includes('horaire') || lowerMessage.includes('heure') || lowerMessage.includes('ouvert')) {
    return `Nos horaires :\n\n• Réception : ${hotelKnowledge.horaires.reception}\n• Restaurant : ${hotelKnowledge.horaires.restaurant}\n• Piscine : ${hotelKnowledge.horaires.piscine}\n• Spa : ${hotelKnowledge.horaires.spa}\n• Petit-déjeuner : ${hotelKnowledge.horaires.petit_dejeuner}`
  }

  // Check-in / Check-out
  if (lowerMessage.includes('check') || lowerMessage.includes('arrivée') || lowerMessage.includes('départ')) {
    return `Check-in : ${hotelKnowledge.reglement.checkin}\nCheck-out : ${hotelKnowledge.reglement.checkout}\n\nPour un check-in anticipé ou un check-out tardif, veuillez nous contacter à l'avance.`
  }

  // Annulation
  if (lowerMessage.includes('annulation') || lowerMessage.includes('remboursement')) {
    return `Politique d'annulation : ${hotelKnowledge.reglement.annulation}\n\nPour annuler une réservation, veuillez contacter notre réception ou utiliser votre espace client.`
  }

  // Animaux
  if (lowerMessage.includes('animal') || lowerMessage.includes('chien') || lowerMessage.includes('chat') || lowerMessage.includes('pet')) {
    return `${hotelKnowledge.reglement.animaux}\n\nVeuillez nous informer lors de votre réservation si vous voyagez avec un animal de compagnie.`
  }

  // Localisation
  if (lowerMessage.includes('où') || lowerMessage.includes('adresse') || lowerMessage.includes('localisation') || lowerMessage.includes('situation')) {
    return `Notre hôtel est situé au ${hotelKnowledge.localisation.adresse}\n\nDistance plage : ${hotelKnowledge.localisation.distance_plage}\nDistance centre-ville : ${hotelKnowledge.localisation.distance_centre}\nDistance aéroport : ${hotelKnowledge.localisation.distance_aeroport}`
  }

  // Paiement
  if (lowerMessage.includes('paiement') || lowerMessage.includes('payer') || lowerMessage.includes('carte')) {
    return `Moyens de paiement acceptés : ${hotelKnowledge.reglement.paiement}\n\nLe paiement est effectué à l\'arrivée ou lors de la réservation en ligne.`
  }

  // Services généraux
  if (lowerMessage.includes('service') || lowerMessage.includes('équipement') || lowerMessage.includes('facilité')) {
    return `Nos services incluent :\n\n• Restaurant : ${hotelKnowledge.services.restaurant.nom}\n• Piscine extérieure chauffée\n• Spa avec soins et massages\n• Parking sécurisé gratuit\n• Wi-Fi haut débit gratuit\n• Réception 24h/24\n• Service chambre\n\nY a-t-il un service particulier qui vous intéresse ?`
  }

  // Merci
  if (lowerMessage.match(/merci|thank|thanks/)) {
    return 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions. Nous sommes là pour vous aider !'
  }

  // Au revoir
  if (lowerMessage.match(/au revoir|bye|à bientôt|ciao/)) {
    return 'Au revoir ! Nous espérons vous voir bientôt dans notre hôtel. Bonne journée !'
  }

  // Réponse par défaut
  return `Je n'ai pas bien compris votre demande. Voici ce que je peux vous aider :\n\n• Informations sur nos chambres (standard, supérieure, suite, deluxe, familiale)\n• Tarifs et disponibilités\n• Services (restaurant, piscine, spa, parking, Wi-Fi)\n• Horaires d'ouverture\n• Localisation et accès\n• Règlement intérieur (check-in, check-out, annulation)\n\nN'hésitez pas à reformuler votre question ou à être plus précis !`
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message invalide' },
        { status: 400 }
      )
    }

    const response = analyzeMessage(message)

    // Simuler un délai de traitement pour plus de réalisme
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre message' },
      { status: 500 }
    )
  }
}
