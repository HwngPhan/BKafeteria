'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/providers/WebSocketProvider'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'sonner'
import { vendorKeys } from '@/features/vendor/data-access/vendor.queries'

export function useVendorWebSocket() {
  const { vendorClient, isVendorConnected } = useWebSocket()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Only subscribe if user is a Manager or Staff and has a vendorId
    if (!isVendorConnected || !vendorClient || !user || !user.vendorId) return
    if (user.role !== 'MANAGER' && user.role !== 'STAFF') return

    console.log('Subscribing to /topic/vendor/' + user.vendorId)

    const subscription = vendorClient.subscribe(`/topic/vendor/${user.vendorId}`, (message) => {
      try {
        const notification = JSON.parse(message.body)
        console.log('Vendor WebSocket received notification:', notification)

        // Show a vibrant notification
        toast.success('Có đơn hàng mới!', {
          description: `Đơn hàng #${notification.orderId.substring(0, 8)} vừa được đặt.`,
          duration: 10000,
        })

        // Play a sound if possible (optional)
        try {
          const audio = new Audio('/assets/sounds/notification.mp3')
          audio.play()
        } catch (e) {
          // Ignore if sound fails
        }

        // Invalidate relevant queries to refresh the vendor's order list
        // Note: Assuming we have vendor order queries under vendorKeys or orderKeys
        queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
        // Also invalidate notifications list if exists
        queryClient.invalidateQueries({ queryKey: ['vendor-notifications'] })

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
