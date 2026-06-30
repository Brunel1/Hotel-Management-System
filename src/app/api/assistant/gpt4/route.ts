import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialiser OpenAI avec GPT-4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Base de connaissances de l'hôtel (contexte système)
const hotelKnowledge = {
  chambres: {
    standard: { description: 'Nos chambres standard offrent tout le confort nécessaire avec un lit double, salle de bain privée, TV écran plat, Wi-Fi gratuit et climatisation.', prix: 'à partir de 50€ par nuit', capacite: '2 personnes', equipements: ['Lit double', 'Salle de bain privée', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Coffre-fort'] },
    superior: { description: 'Les chambres supérieures sont plus spacieuses avec vue sur le jardin ou la ville, minibar et coin travail.', prix: 'à partir de 80€ par nuit', capacite: '2 personnes', equipements: ['Lit double', 'Salle de bain privée', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Minibar', 'Coin travail', 'Vue jardin/ville'] },
    suite: { description: 'Nos suites offrent un espace de vie séparé, balcon privé, baignoire spa et service de chambre inclus.', prix: 'à partir de 150€ par nuit', capacite: '4 personnes', equipements: ['Chambre séparée', 'Salon', 'Balcon privé', 'Baignoire spa', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Minibar', 'Service chambre'] },
    deluxe: { description: 'Les chambres Deluxe sont nos plus belles chambres avec vue mer, terrasse privée et accès VIP.', prix: 'à partir de 200€ par nuit', capacite: '2 personnes', equipements: ['Lit king size', 'Salle de bain luxe', 'Vue mer', 'Terrasse privée', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Accès VIP', 'Robe de chambre'] },
    family: { description: 'Nos chambres familiales sont parfaites pour les familles avec 2 lits séparés et espace enfants.', prix: 'à partir de 120€ par nuit', capacite: '4 personnes', equipements: ['2 lits séparés', 'Salle de bain privée', 'TV écran plat', 'Wi-Fi gratuit', 'Climatisation', 'Espace enfants', 'Chaise haute'] }
  },
  services: {
    restaurant: { nom: 'Le Gourmet', description: 'Notre restaurant propose une cuisine locale et internationale. Ouvert de 7h à 22h.', specialites: ['Plats malgaches', 'Fruits de mer', 'Cuisine internationale', 'Petit-déjeuner buffet'], horaires: '7h00 - 22h00' },
    piscine: { description: 'Piscine extérieure chauffée avec vue panoramique. Ouverte de 8h à 20h.', horaires: '8h00 - 20h00', access: 'Gratuit pour les clients' },
    spa: { description: 'Notre spa propose massages, soins du visage et traitements thalasso.', services: ['Massages', 'Soins du visage', 'Thalasso', 'Sauna', 'Hammam'], horaires: '9h00 - 19h00', reservation: 'Réservation recommandée' },
    parking: { description: 'Parking sécurisé disponible 24h/24.', prix: 'Gratuit pour les clients', capacite: '50 places' },
    wifi: { description: 'Wi-Fi haut débit gratuit dans tout l\'hôtel.', vitesse: '100 Mbps' }
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

const SYSTEM_PROMPT = `Tu es un assistant IA professionnel et convivial pour l'hôtel "Gestion Hôtel" situé à Mahajanga, Madagascar.

Base de connaissances : ${JSON.stringify(hotelKnowledge, null, 2)}

Règles :
- Sois courtois, professionnel et chaleureux
- Réponds en français uniquement
- Sois concis mais informatif
- Utilise des émojis de manière appropriée
- Propose des suggestions proactives
- N'invente jamais d'informations hors de la base`

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message invalide' }, { status: 400 })
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content || "Erreur de génération"

    return NextResponse.json({ response, model: 'gpt-4-turbo-preview' })
  } catch (error) {
    console.error('Erreur GPT-4:', error)
    return NextResponse.json({ error: 'Service indisponible' }, { status: 500 })
  }
}
