import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des rôles et permissions avancés
 */

/**
 * Définition des permissions disponibles
 */
export const PERMISSIONS = {
  // Gestion des réservations
  BOOKINGS_VIEW: 'bookings:view',
  BOOKINGS_CREATE: 'bookings:create',
  BOOKINGS_UPDATE: 'bookings:update',
  BOOKINGS_DELETE: 'bookings:delete',
  BOOKINGS_CANCEL: 'bookings:cancel',
  
  // Gestion des chambres
  ROOMS_VIEW: 'rooms:view',
  ROOMS_CREATE: 'rooms:create',
  ROOMS_UPDATE: 'rooms:update',
  ROOMS_DELETE: 'rooms:delete',
  
  // Gestion des utilisateurs
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Gestion du personnel
  STAFF_VIEW: 'staff:view',
  STAFF_MANAGE: 'staff:manage',
  SCHEDULES_VIEW: 'schedules:view',
  SCHEDULES_MANAGE: 'schedules:manage',
  
  // Gestion de la maintenance
  MAINTENANCE_VIEW: 'maintenance:view',
  MAINTENANCE_MANAGE: 'maintenance:manage',
  HOUSEKEEPING_VIEW: 'housekeeping:view',
  HOUSEKEEPING_MANAGE: 'housekeeping:manage',
  
  // Gestion des stocks
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',
  
  // Gestion des restaurants
  RESTAURANT_VIEW: 'restaurant:view',
  RESTAURANT_MANAGE: 'restaurant:manage',
  
  // Gestion de la caisse
  POS_VIEW: 'pos:view',
  POS_MANAGE: 'pos:manage',
  
  // Gestion des rapports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // Administration système
  ADMIN_VIEW: 'admin:view',
  ADMIN_MANAGE: 'admin:manage',
  SETTINGS_MANAGE: 'settings:manage',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

/**
 * Créer un rôle personnalisé
 */
export async function createRole(data: {
  name: string
  description?: string
  permissions: Permission[]
}) {
  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    },
  })

  return role
}

/**
 * Récupérer tous les rôles
 */
export async function getRoles() {
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
  })

  return roles
}

/**
 * Mettre à jour un rôle
 */
export async function updateRole(roleId: string, data: {
  name?: string
  description?: string
  permissions?: Permission[]
}) {
  const role = await prisma.role.update({
    where: { id: roleId },
    data,
  })

  return role
}

/**
 * Supprimer un rôle
 */
export async function deleteRole(roleId: string) {
  await prisma.role.delete({
    where: { id: roleId },
  })
}

/**
 * Assigner un rôle à un utilisateur
 */
export async function assignRoleToUser(userId: string, roleId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { roleId },
    include: { role: true },
  })

  return user
}

/**
 * Vérifier si un utilisateur a une permission spécifique
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  })

  if (!user || !user.role) {
    return false
  }

  return user.role.permissions.includes(permission)
}

/**
 * Vérifier si un utilisateur a l'une des permissions spécifiées
 */
export async function hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  })

  if (!user || !user.role) {
    return false
  }

  return permissions.some(permission => user.role!.permissions.includes(permission))
}

/**
 * Vérifier si un utilisateur a toutes les permissions spécifiées
 */
export async function hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  })

  if (!user || !user.role) {
    return false
  }

  return permissions.every(permission => user.role!.permissions.includes(permission))
}

/**
 * Obtenir toutes les permissions d'un utilisateur
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  })

  if (!user || !user.role) {
    return []
  }

  return user.role.permissions
}
