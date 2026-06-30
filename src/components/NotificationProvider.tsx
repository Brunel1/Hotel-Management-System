'use client'

import { createContext, useContext, ReactNode } from 'react'
import NotificationPopup, { useNotifications } from './NotificationPopup'

interface NotificationContextType {
  notifications: ReturnType<typeof useNotifications>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notifications = useNotifications()

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
      <NotificationPopup
        notifications={notifications.notifications}
        onClose={notifications.removeNotification}
      />
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context.notifications
}
