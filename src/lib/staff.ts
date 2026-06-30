import { prisma } from '@/lib/prisma'

/**
 * Service de gestion du personnel (horaires, tâches)
 */

/**
 * Créer un horaire pour un membre du personnel
 */
export async function createSchedule(data: {
  userId: string
  date: Date
  startTime: string
  endTime: string
}) {
  const schedule = await prisma.schedule.create({
    data: {
      userId: data.userId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  })

  return schedule
}

/**
 * Récupérer les horaires d'un membre du personnel
 */
export async function getStaffSchedules(userId: string, startDate?: Date, endDate?: Date) {
  const where: any = { userId }

  if (startDate && endDate) {
    where.date = {
      gte: startDate,
      lte: endDate,
    }
  }

  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  })

  return schedules
}

/**
 * Récupérer tous les horaires (admin)
 */
export async function getAllSchedules(date?: Date) {
  const where: any = {}

  if (date) {
    where.date = date
  }

  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  })

  return schedules
}

/**
 * Mettre à jour un horaire
 */
export async function updateSchedule(scheduleId: string, data: {
  date?: Date
  startTime?: string
  endTime?: string
}) {
  const schedule = await prisma.schedule.update({
    where: { id: scheduleId },
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  })

  return schedule
}

/**
 * Supprimer un horaire
 */
export async function deleteSchedule(scheduleId: string) {
  await prisma.schedule.delete({
    where: { id: scheduleId },
  })
}

/**
 * Créer une tâche
 */
export async function createTask(data: {
  title: string
  description?: string
  assignedToId?: string
  priority?: string
  dueDate?: Date
  status?: string
}) {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      assignedToId: data.assignedToId,
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate,
      status: data.status || 'TODO',
    },
    include: {
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
 * Récupérer les tâches d'un membre du personnel
 */
export async function getStaffTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { assignedToId: userId },
    include: {
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
 * Récupérer toutes les tâches (admin)
 */
export async function getAllTasks(status?: string) {
  const where: any = {}

  if (status) {
    where.status = status
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
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
 * Mettre à jour une tâche
 */
export async function updateTask(taskId: string, data: {
  title?: string
  description?: string
  assignedToId?: string
  priority?: string
  dueDate?: Date
  status?: string
}) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
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
 * Supprimer une tâche
 */
export async function deleteTask(taskId: string) {
  await prisma.task.delete({
    where: { id: taskId },
  })
}
