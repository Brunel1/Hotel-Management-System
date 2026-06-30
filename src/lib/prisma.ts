import { PrismaClient } from '@prisma/client'

// Déclaration du type pour étendre PrismaClient avec des méthodes personnalisées
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Création d'une instance singleton de PrismaClient pour éviter les connexions multiples
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
