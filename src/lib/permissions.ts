import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

/**
 * Vérifier si l'utilisateur a le rôle requis
 * @param userRole - Le rôle de l'utilisateur
 * @param requiredRoles - Les rôles requis pour accéder à la ressource
 * @returns True si l'utilisateur a le rôle requis, false sinon
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Vérifier si l'utilisateur est admin
 * @param userRole - Le rôle de l'utilisateur
 * @returns True si l'utilisateur est admin, false sinon
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'ADMIN'
}

/**
 * Vérifier si l'utilisateur est éditeur ou admin
 * @param userRole - Le rôle de l'utilisateur
 * @returns True si l'utilisateur est éditeur ou admin, false sinon
 */
export function isEditorOrAdmin(userRole: UserRole): boolean {
  return userRole === 'EDITOR' || userRole === 'ADMIN'
}

/**
 * Middleware pour vérifier les rôles dans les API routes
 * @param request - La requête Next.js
 * @param requiredRoles - Les rôles requis pour accéder à la ressource
 * @returns NextResponse si l'accès est refusé, null si l'accès est autorisé
 */
export function checkRole(
  request: NextRequest,
  requiredRoles: UserRole[]
): NextResponse | null {
  const userRole = request.headers.get('x-user-role') as UserRole

  if (!userRole) {
    return NextResponse.json(
      { error: 'Rôle utilisateur non trouvé' },
      { status: 401 }
    )
  }

  if (!hasRole(userRole, requiredRoles)) {
    return NextResponse.json(
      { error: 'Accès non autorisé' },
      { status: 403 }
    )
  }

  return null
}

/**
 * Middleware pour vérifier si l'utilisateur est admin
 * @param request - La requête Next.js
 * @returns NextResponse si l'accès est refusé, null si l'accès est autorisé
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  return checkRole(request, ['ADMIN'])
}

/**
 * Middleware pour vérifier si l'utilisateur est éditeur ou admin
 * @param request - La requête Next.js
 * @returns NextResponse si l'accès est refusé, null si l'accès est autorisé
 */
export function requireEditorOrAdmin(request: NextRequest): NextResponse | null {
  return checkRole(request, ['EDITOR', 'ADMIN'])
}

/**
 * Récupérer l'ID de l'utilisateur depuis les en-têtes
 * @param request - La requête Next.js
 * @returns L'ID de l'utilisateur ou null si non trouvé
 */
export function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

/**
 * Récupérer l'email de l'utilisateur depuis les en-têtes
 * @param request - La requête Next.js
 * @returns L'email de l'utilisateur ou null si non trouvé
 */
export function getUserEmail(request: NextRequest): string | null {
  return request.headers.get('x-user-email')
}

/**
 * Récupérer le rôle de l'utilisateur depuis les en-têtes
 * @param request - La requête Next.js
 * @returns Le rôle de l'utilisateur ou null si non trouvé
 */
export function getUserRole(request: NextRequest): UserRole | null {
  const role = request.headers.get('x-user-role')
  return role as UserRole | null
}
