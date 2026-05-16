import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ManagerNotification {
  vendorOrderId: string;
  isRead: boolean;
}

interface ManagerNotificationStore {
  readNotifications: Record<string, boolean>;
  markAsRead: (vendorOrderId: string) => void;
  isRead: (vendorOrderId: string) => boolean;
}

export const useManagerNotifications = create<ManagerNotificationStore>()(
  persist(
    (set, get) => ({
      readNotifications: {},
      markAsRead: (vendorOrderId) => set((state) => ({
        readNotifications: { ...state.readNotifications, [vendorOrderId]: true }
      })),
      isRead: (vendorOrderId) => !!get().readNotifications[vendorOrderId],
    }),
    {
      name: 'manager-notifications',
    }
  )
)
