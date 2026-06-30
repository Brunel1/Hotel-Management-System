import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les campagnes email (simulées pour l'instant)
    const campaigns = [
      {
        id: '1',
        name: 'Offre Spéciale Été',
        subject: 'Profitez de -20% sur votre séjour',
        status: 'active',
        sentAt: '2024-06-01',
        openRate: 45,
        clickRate: 12,
        recipients: 1500,
      },
      {
        id: '2',
        name: 'Rappel Réservation',
        subject: 'N\'oubliez pas votre réservation',
        status: 'scheduled',
        sentAt: null,
        openRate: 0,
        clickRate: 0,
        recipients: 200,
      },
    ]

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, content, scheduledDate } = body

    // Créer une nouvelle campagne (simulée)
    const newCampaign = {
      id: Date.now().toString(),
      name,
      subject,
      status: 'draft',
      sentAt: null,
      openRate: 0,
      clickRate: 0,
      recipients: 0,
    }

    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la campagne:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la campagne:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de la campagne:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
