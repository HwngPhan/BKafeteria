'use client'

import { useEffect } from 'react'
import { useWebSocket } from '@/providers/WebSocketProvider'
import { useAuth } from '@/providers/AuthProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { toast } from 'sonner'
import { useCustomerNotifications } from './useCustomerNotifications'
import { useRealtimeOrders } from './useRealtimeOrders'

export function useOrderWebSocket() {
  const { orderClient, isOrderConnected } = useWebSocket()
  const { user } = useAuth()
  const { t } = useLanguage()
  const addNotification = useCustomerNotifications(state => state.addNotification)
  const pushUpdate = useRealtimeOrders(state => state.pushUpdate)

  useEffect(() => {
    if (!isOrderConnected || !orderClient || !user) return

    console.log('Subscribing to /topic/customer/' + user.userId)

    const subscription = orderClient.subscribe(`/topic/customer/${user.userId}`, (message) => {
      try {
        const update = JSON.parse(message.body)
        console.log('WebSocket received order update:', update)

        // Push into the realtime Zustand store — pages will pick this up
        pushUpdate({
          orderId: update.orderId,
          vendorOrderId: update.vendorOrderId,
          vendorId: update.vendorId,
          customerId: update.customerId,
          status: update.status,
          message: update.message,
          timestamp: update.timestamp || new Date().toISOString(),
        })

        // Show toast with translated status
        const statusKey = `order_status.${update.status?.toLowerCase()}`
        const statusLabel = t(statusKey) !== statusKey ? t(statusKey) : update.status
        toast.info(
          t('orders.status_changed').replace('{status}', statusLabel),
          { duration: 5000 }
        )

        // Add to persistent notification store
        addNotification({
          orderId: update.orderId,
          vendorOrderId: update.vendorOrderId,
          status: update.status,
          message: update.message || t('orders.status_changed').replace('{status}', statusLabel),
          timestamp: new Date().toISOString()
        })

      } catch (err) {
        console.error('Error parsing WebSocket message', err)
      }
    })

    return () => {
      console.log('Unsubscribing from /topic/customer/' + user.userId)
      subscription.unsubscribe()
    }
  }, [orderClient, isOrderConnected, user])
}
