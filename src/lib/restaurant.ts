import { prisma } from '@/lib/prisma'

/**
 * Service de gestion des restaurants et room service
 */

/**
 * Créer une commande de restaurant
 */
export async function createRestaurantOrder(data: {
  bookingId?: string
  userId?: string
  type: string
  items: Array<{
    menuItemId: string
    quantity: number
    price: number
  }>
  specialRequests?: string
}) {
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const order = await prisma.restaurantOrder.create({
    data: {
      bookingId: data.bookingId,
      userId: data.userId,
      type: data.type,
      total,
      specialRequests: data.specialRequests,
      status: 'PENDING',
    },
  })

  for (const item of data.items) {
    await prisma.restaurantOrderItem.create({
      data: {
        orderId: order.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
      },
    })
  }

  return order
}

/**
 * Récupérer les commandes de restaurant
 */
export async function getRestaurantOrders(filters?: {
  bookingId?: string
  userId?: string
  status?: string
  type?: string
}) {
  const where: any = {}

  if (filters?.bookingId) where.bookingId = filters.bookingId
  if (filters?.userId) where.userId = filters.userId
  if (filters?.status) where.status = filters.status
  if (filters?.type) where.type = filters.type

  const orders = await prisma.restaurantOrder.findMany({
    where,
    include: {
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      },
      booking: {
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders
}

/**
 * Mettre à jour une commande de restaurant
 */
export async function updateRestaurantOrder(orderId: string, data: {
  status?: string
  specialRequests?: string
}) {
  const order = await prisma.restaurantOrder.update({
    where: { id: orderId },
    data,
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  })

  return order
}

/**
 * Créer un élément de menu
 */
export async function createMenuItem(data: {
  name: string
  category: string
  description?: string
  price: number
  available: boolean
}) {
  const menuItem = await prisma.menuItem.create({
    data,
  })

  return menuItem
}

/**
 * Récupérer les éléments de menu
 */
export async function getMenuItems(filters?: {
  category?: string
  available?: boolean
}) {
  const where: any = {}

  if (filters?.category) where.category = filters.category
  if (filters?.available !== undefined) where.available = filters.available

  const menuItems = await prisma.menuItem.findMany({
    where,
    orderBy: { category: 'asc' },
  })

  return menuItems
}

/**
 * Mettre à jour un élément de menu
 */
export async function updateMenuItem(menuItemId: string, data: {
  name?: string
  category?: string
  description?: string
  price?: number
  available?: boolean
}) {
  const menuItem = await prisma.menuItem.update({
    where: { id: menuItemId },
    data,
  })

  return menuItem
}

/**
 * Supprimer un élément de menu
 */
export async function deleteMenuItem(menuItemId: string) {
  await prisma.menuItem.delete({
    where: { id: menuItemId },
  })
}
