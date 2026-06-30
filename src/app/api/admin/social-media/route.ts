import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    // Récupérer les posts sociaux (simulés pour l'instant)
    const posts = [
      {
        id: '1',
        platform: 'facebook',
        content: 'Découvrez nos nouvelles suites luxueuses !',
        publishedAt: '2024-06-01',
        likes: 150,
        shares: 25,
        comments: 12,
      },
      {
        id: '2',
        platform: 'instagram',
        content: 'Vue imprenable depuis notre rooftop 🌅',
        publishedAt: '2024-06-05',
        likes: 320,
        shares: 45,
        comments: 28,
      },
      {
        id: '3',
        platform: 'twitter',
        content: 'Offre spéciale -20% ce week-end !',
        publishedAt: '2024-06-10',
        likes: 85,
        shares: 15,
        comments: 8,
      },
    ]

    const filteredPosts = platform ? posts.filter((p) => p.platform === platform) : posts

    return NextResponse.json(filteredPosts)
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error)
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
    const { platform, content, scheduledDate } = body

    const newPost = {
      id: Date.now().toString(),
      platform,
      content,
      publishedAt: scheduledDate || new Date().toISOString().split('T')[0],
      likes: 0,
      shares: 0,
      comments: 0,
    }

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
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
    console.error('Erreur lors de la suppression du post:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
