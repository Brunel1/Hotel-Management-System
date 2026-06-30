import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const week = searchParams.get('week')

    // Récupérer le personnel et les quarts (simulés pour l'instant)
    const staff = [
      { id: '1', name: 'Jean Dupont', role: 'RECEPTIONIST', email: 'jean@hotel.com' },
      { id: '2', name: 'Marie Martin', role: 'HOUSEKEEPER', email: 'marie@hotel.com' },
      { id: '3', name: 'Pierre Bernard', role: 'MAINTENANCE', email: 'pierre@hotel.com' },
      { id: '4', name: 'Sophie Petit', role: 'RECEPTIONIST', email: 'sophie@hotel.com' },
    ]

    const shifts = [
      {
        id: '1',
        staffId: '1',
        date: '2024-06-24',
        startTime: '08:00',
        endTime: '16:00',
        role: 'RECEPTIONIST',
      },
      {
        id: '2',
        staffId: '2',
        date: '2024-06-24',
        startTime: '09:00',
        endTime: '17:00',
        role: 'HOUSEKEEPER',
      },
      {
        id: '3',
        staffId: '1',
        date: '2024-06-25',
        startTime: '08:00',
        endTime: '16:00',
        role: 'RECEPTIONIST',
      },
      {
        id: '4',
        staffId: '3',
        date: '2024-06-25',
        startTime: '10:00',
        endTime: '18:00',
        role: 'MAINTENANCE',
      },
    ]

    const filteredStaff = role ? staff.filter((s) => s.role === role) : staff

    return NextResponse.json({
      staff: filteredStaff,
      shifts,
      stats: {
        totalStaff: staff.length,
        totalShifts: shifts.length,
        byRole: {
          RECEPTIONIST: staff.filter((s) => s.role === 'RECEPTIONIST').length,
          HOUSEKEEPER: staff.filter((s) => s.role === 'HOUSEKEEPER').length,
          MAINTENANCE: staff.filter((s) => s.role === 'MAINTENANCE').length,
        },
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du planning:', error)
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
    const { staffId, date, startTime, endTime, role } = body

    const newShift = {
      id: Date.now().toString(),
      staffId,
      date,
      startTime,
      endTime,
      role,
    }

    return NextResponse.json(newShift, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du quart:', error)
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
    const { id, staffId, date, startTime, endTime, role } = body

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du quart:', error)
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
    console.error('Erreur lors de la suppression du quart:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
