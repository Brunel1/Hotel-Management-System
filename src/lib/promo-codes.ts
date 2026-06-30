import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des codes de réduction
 */

/**
 * Valider un code de réduction
 */
export async function validatePromoCode(code: string, amount: number): Promise<{ valid: boolean; discount: number; message: string }> {
  const promoCode = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!promoCode) {
    return { valid: false, discount: 0, message: 'Code de réduction invalide' }
  }

  if (!promoCode.isActive) {
    return { valid: false, discount: 0, message: 'Ce code de réduction n&apos;est plus actif' }
  }

  const now = new Date()
  if (now < promoCode.validFrom || now > promoCode.validUntil) {
    return { valid: false, discount: 0, message: 'Ce code de réduction n&apos;est plus valide' }
  }

  if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
    return { valid: false, discount: 0, message: 'Ce code de réduction a atteint sa limite d&apos;utilisation' }
  }

  if (promoCode.minAmount && amount < Number(promoCode.minAmount)) {
    return { valid: false, discount: 0, message: `Montant minimum requis: ${Number(promoCode.minAmount)}€` }
  }

  // Calculer la réduction
  let discount = 0
  if (promoCode.discountType === 'PERCENTAGE') {
    discount = amount * Number(promoCode.discountValue)
  } else if (promoCode.discountType === 'FIXED_AMOUNT') {
    discount = Number(promoCode.discountValue)
  }

  // Appliquer la réduction maximale si définie
  if (promoCode.maxDiscount && discount > Number(promoCode.maxDiscount)) {
    discount = Number(promoCode.maxDiscount)
  }

  // La réduction ne peut pas dépasser le montant total
  if (discount > amount) {
    discount = amount
  }

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100,
    message: promoCode.description || 'Code de réduction valide',
  }
}

/**
 * Appliquer un code de réduction
 */
export async function applyPromoCode(code: string, amount: number): Promise<{ success: boolean; discount: number; finalAmount: number; message: string }> {
  const validation = await validatePromoCode(code, amount)

  if (!validation.valid) {
    return {
      success: false,
      discount: 0,
      finalAmount: amount,
      message: validation.message,
    }
  }

  // Incrémenter le compteur d'utilisations
  await prisma.promoCode.update({
    where: { code: code.toUpperCase() },
    data: { currentUses: { increment: 1 } },
  })

  return {
    success: true,
    discount: validation.discount,
    finalAmount: amount - validation.discount,
    message: validation.message,
  }
}

/**
 * Créer un nouveau code de réduction
 */
export async function createPromoCode(data: {
  code: string
  description?: string
  discountType: string
  discountValue: number
  minAmount?: number
  maxDiscount?: number
  validFrom: Date
  validUntil: Date
  maxUses?: number
}) {
  const promoCode = await prisma.promoCode.create({
    data: {
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minAmount: data.minAmount,
      maxDiscount: data.maxDiscount,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      maxUses: data.maxUses,
    },
  })

  return promoCode
}

/**
 * Récupérer tous les codes de réduction
 */
export async function getAllPromoCodes() {
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return promoCodes
}

/**
 * Désactiver un code de réduction
 */
export async function deactivatePromoCode(code: string) {
  const promoCode = await prisma.promoCode.update({
    where: { code: code.toUpperCase() },
    data: { isActive: false },
  })

  return promoCode
}
