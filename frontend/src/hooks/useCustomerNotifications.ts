import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CustomerNotification {
  id: string;
  orderId: string;
  message: string;
  status: string;
  timestamp: string;
  isRead: boolean;
}

interface CustomerNotificationStore {
  notifications: CustomerNotification[];
  addNotification: (notification: Omit<CustomerNotification, 'id' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useCustomerNotifications = create<CustomerNotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notif) => set((state) => ({
        notifications: [
          { ...notif, id: Date.now().toString(), isRead: false },
          ...state.notifications
        ].slice(0, 50) // Keep last 50
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
      clearAll: () => set({ notifications: [] }),
      getUnreadCount: () => get().notifications.filter(n => !n.isRead).length
    }),
    {
      name: 'customer-notifications',
    }
  )
)
