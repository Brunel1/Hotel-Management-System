import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

/**
 * Proxy pour protéger les routes nécessitant une authentification
 */
export function proxy(request: NextRequest) {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  // Si aucun token n'est fourni, retourner une erreur 401
  if (!token) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  // Vérifier le token
  const payload = verifyToken(token)

  // Si le token est invalide, retourner une erreur 401
  if (!payload) {
    return NextResponse.json(
      { error: 'Token invalide ou expiré' },
      { status: 401 }
    )
  }

  // Ajouter les informations de l'utilisateur à la requête
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)

  // Continuer avec la requête modifiée
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

/**
 * Configuration des routes à protéger par le proxy
 */
export const config = {
  matcher: [
    // Protéger toutes les routes API sauf auth, seed, rooms, demo-rooms et bookings
    '/api/((?!auth|seed|rooms|demo-rooms|bookings).*)',
    // Protéger les routes API admin
    '/api/admin/:path*',
  ],
}
