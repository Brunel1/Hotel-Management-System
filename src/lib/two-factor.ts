import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

/**
 * Service de gestion de l'authentification à deux facteurs (2FA)
 */

/**
 * Générer un secret 2FA pour un utilisateur
 */
export async function generateTwoFactorSecret(userId: string): Promise<{ secret: string; qrCode: string }> {
  const secret = speakeasy.generateSecret({
    name: 'Gestion Hôtelière',
    issuer: 'Gestion Hôtelière',
  })

  // Générer le QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url || '')

  // Sauvegarder le secret dans la base de données
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret.base32,
    },
  })

  return {
    secret: secret.base32,
    qrCode,
  }
}

/**
 * Activer la 2FA pour un utilisateur
 */
export async function enableTwoFactor(userId: string, token: string): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || !user.twoFactorSecret) {
    return { success: false, message: 'Secret 2FA non trouvé' }
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
  })

  if (!verified) {
    return { success: false, message: 'Token invalide' }
  }

  // Générer des codes de sauvegarde
  const backupCodes = Array.from({ length: 10 }, () =>
    speakeasy.generateSecret({ length: 20 }).base32.substring(0, 10)
  )

  // Activer la 2FA et sauvegarder les codes de sauvegarde
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorBackupCodes: backupCodes,
    },
  })

  return {
    success: true,
    message: '2FA activée avec succès',
  }
}

/**
 * Désactiver la 2FA pour un utilisateur
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  })
}

/**
 * Vérifier un token 2FA
 */
export async function verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || !user.twoFactorEnabled) {
    return false
  }

  // Vérifier le token TOTP
  if (user.twoFactorSecret) {
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    })
    if (verified) {
      return true
    }
  }

  // Vérifier les codes de sauvegarde
  if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.includes(token)) {
    // Supprimer le code de sauvegarde utilisé
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: {
          set: user.twoFactorBackupCodes.filter((code) => code !== token),
        },
      },
    })
    return true
  }

  return false
}

/**
 * Vérifier si un utilisateur a la 2FA activée
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  })

  return user?.twoFactorEnabled || false
}
