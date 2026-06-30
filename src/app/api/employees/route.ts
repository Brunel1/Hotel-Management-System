import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/permissions'

/**
 * Route API pour la gestion des employés
 * GET /api/employees - Récupérer tous les employés
 * POST /api/employees - Créer un nouvel employé
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const employees = await prisma.user.findMany({
      where: {
        role: { name: { in: ['ADMIN', 'EDITOR', 'STAFF'] } },
      },
      include: {
        profile: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transformer les données pour correspondre à l'interface
    const transformedEmployees = employees.map(emp => ({
      id: emp.id,
      firstName: emp.profile?.firstName || '',
      lastName: emp.profile?.lastName || '',
      email: emp.email,
      position: emp.role?.name || 'STAFF',
      department: 'Hôtel',
      status: emp.isActive ? 'ACTIVE' : 'INACTIVE',
      hireDate: emp.createdAt,
    }))

    return NextResponse.json(transformedEmployees, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des employés' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const userRole = request.headers.get('x-user-role')

    // Vérifier les permissions (seuls les admins peuvent créer des employés)
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, email, password, role, department } = body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Créer l'employé avec son profil
    const employee = await prisma.user.create({
      data: {
        email,
        password, // Note: Le mot de passe devrait être hashé dans une vraie application
        isActive: true,
        twoFactorBackupCodes: [], // Champ requis par le schéma
        profile: {
          create: {
            firstName,
            lastName,
            allergies: '',
          },
        },
      },
    })

    return NextResponse.json(
      { message: 'Employé créé avec succès', employee },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'employé' },
      { status: 500 }
    )
  }
}
