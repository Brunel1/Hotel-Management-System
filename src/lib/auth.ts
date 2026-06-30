import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Configuration du JWT
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Interface pour le payload JWT
export interface JWTPayload {
  userId: string
  email: string
  role: string
}

/**
 * Hasher un mot de passe
 * @param password - Le mot de passe en clair
 * @returns Le mot de passe hashé
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Vérifier un mot de passe
 * @param password - Le mot de passe en clair
 * @param hashedPassword - Le mot de passe hashé
 * @returns True si le mot de passe est correct, false sinon
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Générer un token JWT
 * @param payload - Les données à inclure dans le token
 * @returns Le token JWT
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string,
  })
}

/**
 * Vérifier un token JWT
 * @param token - Le token JWT à vérifier
 * @returns Le payload du token si valide, null sinon
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch {
    return null
  }
}

/**
 * Extraire le token depuis l'en-tête Authorization
 * @param authHeader - L'en-tête Authorization
 * @returns Le token si présent, null sinon
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
