import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWaitlistForRoom, updateWaitlistStatus, removeFromWaitlist, notifyWaitlistForRoom } from '@/lib/waitlist'

/**
 * Route API pour récupérer la liste d'attente pour une chambre
 * GET /api/admin/waitlist?roomId=
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')

    if (roomId) {
      const waitlist = await getWaitlistForRoom(roomId)
      return NextResponse.json(waitlist, { status: 200 })
    }

    // Récupérer toute la liste d'attente
    const waitlist = await prisma.waitlist.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(waitlist, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste d&apos;attente:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de la liste d&apos;attente' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour mettre à jour le statut d'une entrée de la liste d'attente
 * PATCH /api/admin/waitlist
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { waitlistId, status } = body

    if (!waitlistId || !status) {
      return NextResponse.json(
        { error: 'waitlistId et status requis' },
        { status: 400 }
      )
    }

    const waitlist = await updateWaitlistStatus(waitlistId, status)

    return NextResponse.json(waitlist, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la liste d&apos;attente:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la liste d&apos;attente' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour supprimer une entrée de la liste d'attente
 * DELETE /api/admin/waitlist?waitlistId=
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const waitlistId = searchParams.get('waitlistId')

    if (!waitlistId) {
      return NextResponse.json(
        { error: 'waitlistId requis' },
        { status: 400 }
      )
    }

    await removeFromWaitlist(waitlistId)

    return NextResponse.json(
      { message: 'Entrée supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de la liste d&apos;attente:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la liste d&apos;attente' },
      { status: 500 }
    )
  }
}

/**
 * Route API pour notifier les utilisateurs en liste d'attente
 * POST /api/admin/waitlist/notify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, checkIn, checkOut } = body

    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'roomId, checkIn et checkOut requis' },
        { status: 400 }
      )
    }

    const notifiedUsers = await notifyWaitlistForRoom(
      roomId,
      new Date(checkIn),
      new Date(checkOut)
    )

    return NextResponse.json(
      { message: 'Notifications envoyées', notifiedUsers },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la notification de la liste d&apos;attente:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la notification de la liste d&apos;attente' },
      { status: 500 }
    )
  }
}
