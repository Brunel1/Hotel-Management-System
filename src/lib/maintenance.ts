import { prisma } from '@/lib/prisma'

/**
 * Service de gestion de la maintenance et ménage
 */

/**
 * Créer une tâche de maintenance
 */
export async function createMaintenanceTask(data: {
  roomId: string
  type: string
  description: string
  priority?: string
  dueDate?: Date
  assignedToId?: string
}) {
  const task = await prisma.maintenanceTask.create({
    data: {
      roomId: data.roomId,
      type: data.type,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate,
      assignedToId: data.assignedToId,
      status: 'PENDING',
    },
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  })

  return task
}

/**
 * Récupérer toutes les tâches de maintenance
 */
export async function getMaintenanceTasks(filters?: {
  roomId?: string
  status?: string
  type?: string
}) {
  const where: any = {}

  if (filters?.roomId) {
    where.roomId = filters.roomId
  }
  if (filters?.status) {
    where.status = filters.status
  }
  if (filters?.type) {
    where.type = filters.type
  }

  const tasks = await prisma.maintenanceTask.findMany({
    where,
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  return tasks
}

/**
 * Mettre à jour une tâche de maintenance
 */
export async function updateMaintenanceTask(taskId: string, data: {
  type?: string
  description?: string
  priority?: string
  dueDate?: Date
  assignedToId?: string
  status?: string
}) {
  const task = await prisma.maintenanceTask.update({
    where: { id: taskId },
    data,
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  })

  return task
}

/**
 * Supprimer une tâche de maintenance
 */
export async function deleteMaintenanceTask(taskId: string) {
  await prisma.maintenanceTask.delete({
    where: { id: taskId },
  })
}

/**
 * Créer un enregistrement de ménage
 */
export async function createHousekeepingRecord(data: {
  roomId: string
  status: string
  notes?: string
  assignedToId?: string
}) {
  const record = await prisma.housekeepingRecord.create({
    data: {
      roomId: data.roomId,
      status: data.status,
      notes: data.notes,
      assignedToId: data.assignedToId,
    },
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  })

  return record
}

/**
 * Récupérer les enregistrements de ménage
 */
export async function getHousekeepingRecords(filters?: {
  roomId?: string
  status?: string
  date?: Date
}) {
  const where: any = {}

  if (filters?.roomId) {
    where.roomId = filters.roomId
  }
  if (filters?.status) {
    where.status = filters.status
  }
  if (filters?.date) {
    where.createdAt = {
      gte: new Date(filters.date.setHours(0, 0, 0, 0)),
      lt: new Date(filters.date.setHours(23, 59, 59, 999)),
    }
  }

  const records = await prisma.housekeepingRecord.findMany({
    where,
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return records
}

/**
 * Mettre à jour un enregistrement de ménage
 */
export async function updateHousekeepingRecord(recordId: string, data: {
  status?: string
  notes?: string
  assignedToId?: string
}) {
  const record = await prisma.housekeepingRecord.update({
    where: { id: recordId },
    data,
    include: {
      room: {
        select: {
          id: true,
          number: true,
          type: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  })

  return record
}
