'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/providers/WebSocketProvider'
import { useAuth } from '@/providers/AuthProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { toast } from 'sonner'
import { vendorOrderKeys } from '@/features/vendor/data-access/vendor-order.queries'
import { VendorOrderNotification } from '@/features/vendor/config/vendor-order.config'

export function useVendorWebSocket() {
  const { vendorClient, isVendorConnected } = useWebSocket()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { t } = useLanguage()

  useEffect(() => {
    // Only subscribe if user is a Manager or Staff and has a vendorId
    if (!isVendorConnected || !vendorClient || !user || !user.vendorId) return
    if (user.role !== 'MANAGER' && user.role !== 'STAFF') return

    console.log('Subscribing to /topic/vendor/' + user.vendorId)

    const subscription = vendorClient.subscribe(`/topic/vendor/${user.vendorId}`, (message) => {
      try {
        const notification = JSON.parse(message.body)
        console.log('Vendor WebSocket received notification:', notification)

        // Show a vibrant notification with i18n
        toast.success(t('vendor_ws.new_order'), {
          description: t('vendor_ws.new_order_desc').replace('{id}', notification.orderId?.substring(0, 8) || ''),
          duration: 10000,
        })

        // Play a notification sound
        try {
          const audio = new Audio('/assets/sounds/notification.mp3')
          audio.play()
        } catch (e) {
          // Ignore if sound fails
        }

        // Optimistically inject the new notification into the notifications cache
        queryClient.setQueryData<VendorOrderNotification[]>(
          vendorOrderKeys.notifications(),
          (old) => {
            if (!old) return [notification]
            // Avoid duplicates
            const exists = old.some(n => n.vendorOrderId === notification.vendorOrderId)
            if (exists) return old
            return [
              {
                vendorOrderId: notification.vendorOrderId,
                orderId: notification.orderId,
                vendorId: notification.vendorId,
                customerId: notification.customerId,
                status: notification.status || 'PURCHASED',
                menuItems: notification.menuItems || [],
                createdAt: new Date().toISOString(),
                readyAt: null,
              },
              ...old,
            ]
          }
        )

        // Background refetch for full consistency
        queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all })

      } catch (err) {
        console.error('Error parsing Vendor WebSocket message', err)
      }
    })

    return () => {
      console.log('Unsubscribing from /topic/vendor/' + user.vendorId)
      subscription.unsubscribe()
    }
  }, [vendorClient, isVendorConnected, user, queryClient])
}
