import { validatePromoCode, applyPromoCode } from '@/lib/promo-codes'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    promoCode: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

describe('Promo Codes Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validatePromoCode', () => {
    it('should validate an active promo code', async () => {
      const mockPromoCode = {
        id: '1',
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minAmount: 0,
        maxDiscount: null,
        usageLimit: 100,
        usageCount: 5,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
      }

      ;(prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(mockPromoCode)

      const result = await validatePromoCode('TEST10', 100)

      expect(result.valid).toBe(true)
      expect(result.discountValue).toBe(10)
      expect(result.finalAmount).toBe(90)
    })

    it('should reject an inactive promo code', async () => {
      const mockPromoCode = {
        id: '1',
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minAmount: 0,
        maxDiscount: null,
        usageLimit: 100,
        usageCount: 5,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: false,
      }

      ;(prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(mockPromoCode)

      const result = await validatePromoCode('TEST10', 100)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('inactif')
    })

    it('should reject a promo code that has reached usage limit', async () => {
      const mockPromoCode = {
        id: '1',
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minAmount: 0,
        maxDiscount: null,
        usageLimit: 10,
        usageCount: 10,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
      }

      ;(prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(mockPromoCode)

      const result = await validatePromoCode('TEST10', 100)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('limite')
    })

    it('should reject a promo code that is expired', async () => {
      const mockPromoCode = {
        id: '1',
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minAmount: 0,
        maxDiscount: null,
        usageLimit: 100,
        usageCount: 5,
        validFrom: new Date('2023-01-01'),
        validUntil: new Date('2023-12-31'),
        isActive: true,
      }

      ;(prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(mockPromoCode)

      const result = await validatePromoCode('TEST10', 100)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('expiré')
    })

    it('should reject a promo code if amount is below minimum', async () => {
      const mockPromoCode = {
        id: '1',
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minAmount: 100,
        maxDiscount: null,
        usageLimit: 100,
        usageCount: 5,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
      }

      ;(prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(mockPromoCode)

      const result = await validatePromoCode('TEST10', 50)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('minimum')
    })
  })

  describe('applyPromoCode', () => {
    it('should apply a percentage discount', async () => {
      const mockPromoCode = {
        id: '1',
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minAmount: 0,
        maxDiscount: null,
        usageLimit: 100,
        usageCount: 5,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
      }

      ;(prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(mockPromoCode)
      ;(prisma.promoCode.update as jest.Mock).mockResolvedValue({ ...mockPromoCode, usageCount: 6 })

      const result = await applyPromoCode('TEST10', 100)

      expect(result.success).toBe(true)
      expect(result.finalAmount).toBe(90)
      expect(result.discount).toBe(10)
    })

    it('should apply a fixed discount', async () => {
      const mockPromoCode = {
        id: '1',
        code: 'SAVE20',
        discountType: 'FIXED',
        discountValue: 20,
        minAmount: 0,
        maxDiscount: null,
        usageLimit: 100,
        usageCount: 5,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
      }

      ;(prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(mockPromoCode)
      ;(prisma.promoCode.update as jest.Mock).mockResolvedValue({ ...mockPromoCode, usageCount: 6 })

      const result = await applyPromoCode('SAVE20', 100)

      expect(result.success).toBe(true)
      expect(result.finalAmount).toBe(80)
      expect(result.discount).toBe(20)
    })

    it('should respect max discount limit', async () => {
      const mockPromoCode = {
        id: '1',
        code: 'TEST50',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minAmount: 0,
        maxDiscount: 30,
        usageLimit: 100,
        usageCount: 5,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
      }

      ;(prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(mockPromoCode)
      ;(prisma.promoCode.update as jest.Mock).mockResolvedValue({ ...mockPromoCode, usageCount: 6 })

      const result = await applyPromoCode('TEST50', 100)

      expect(result.success).toBe(true)
      expect(result.finalAmount).toBe(70)
      expect(result.discount).toBe(30)
    })
  })
})
