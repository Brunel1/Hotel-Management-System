import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des logs d'audit
 */

/**
 * Créer un log d'audit
 */
export async function createAuditLog(data: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
}) {
  const auditLog = await prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  })

  return auditLog
}

/**
 * Récupérer tous les logs d'audit
 */
export async function getAuditLogs(filters?: {
  userId?: string
  action?: string
  entity?: string
  limit?: number
  offset?: number
}) {
  const where: any = {}

  if (filters?.userId) {
    where.userId = filters.userId
  }

  if (filters?.action) {
    where.action = filters.action
  }

  if (filters?.entity) {
    where.entity = filters.entity
  }

  const auditLogs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
  })

  return auditLogs
}

/**
 * Récupérer les logs d'audit pour une entité spécifique
 */
export async function getAuditLogsForEntity(entity: string, entityId: string) {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entity,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return auditLogs
}

/**
 * Récupérer les logs d'audit pour un utilisateur spécifique
 */
export async function getAuditLogsForUser(userId: string) {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return auditLogs
}

/**
 * Logger une action d'authentification
 */
export async function logAuthAction(data: {
  userId?: string
  action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_CHANGE' | '2FA_ENABLED' | '2FA_DISABLED'
  ipAddress?: string
  userAgent?: string
  details?: string
}) {
  return createAuditLog({
    userId: data.userId,
    action: data.action,
    entity: 'AUTH',
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })
}

/**
 * Logger une action de réservation
 */
export async function logBookingAction(data: {
  userId?: string
  action: 'CREATE' | 'UPDATE' | 'CANCEL' | 'CONFIRM' | 'CHECK_IN' | 'CHECK_OUT'
  bookingId: string
  details?: string
  ipAddress?: string
  userAgent?: string
}) {
  return createAuditLog({
    userId: data.userId,
    action: data.action,
    entity: 'BOOKING',
    entityId: data.bookingId,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })
}

/**
 * Logger une action de chambre
 */
export async function logRoomAction(data: {
  userId?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  roomId: string
  details?: string
  ipAddress?: string
  userAgent?: string
}) {
  return createAuditLog({
    userId: data.userId,
    action: data.action,
    entity: 'ROOM',
    entityId: data.roomId,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })
}

/**
 * Logger une action d'utilisateur
 */
export async function logUserAction(data: {
  userId?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE'
  targetUserId: string
  details?: string
  ipAddress?: string
  userAgent?: string
}) {
  return createAuditLog({
    userId: data.userId,
    action: data.action,
    entity: 'USER',
    entityId: data.targetUserId,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })
}

/**
 * Logger une action de configuration
 */
export async function logConfigAction(data: {
  userId?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  entityId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
}) {
  return createAuditLog({
    userId: data.userId,
    action: data.action,
    entity: data.entity,
    entityId: data.entityId,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })
}
