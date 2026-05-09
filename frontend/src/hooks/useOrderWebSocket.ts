'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/providers/WebSocketProvider'
import { useAuth } from '@/providers/AuthProvider'
import { orderKeys } from '@/features/order/data-access/order.queries'
import { OrderDto } from '@/features/order/config/order.types'
import { toast } from 'sonner'

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PURCHASED: 'Đã thanh toán',
  PROCESSING: 'Đang chế biến',
  COMPLETED: 'Hoàn thành',
  DELIVERED: 'Đã giao',
  CANCELED: 'Đã hủy',
}

export function useOrderWebSocket() {
  const { orderClient, isOrderConnected } = useWebSocket()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isOrderConnected || !orderClient || !user) return

    console.log('Subscribing to /topic/customer/' + user.userId)

    const subscription = orderClient.subscribe(`/topic/customer/${user.userId}`, (message) => {
      try {
        const update = JSON.parse(message.body)
        console.log('WebSocket received order update:', update)

        // Optimistic UI Update for my orders list
        queryClient.setQueryData<OrderDto[]>(orderKeys.mine(), (oldData) => {
          if (!oldData) return oldData
          
          return oldData.map((order) => {
            if (order.orderId === update.orderId) {
              // Update the specific vendor order status inside the order
              // Or the overall order status if that is what the update represents
              // Depending on backend logic, if it's overall order status:
              let overallStatusUpdated = false
              const updatedOrderItems = order.orderItems?.map(vo => {
                if (vo.vendorId === update.vendorId) {
                  return { ...vo, status: update.status }
                }
                return vo
              })

              return {
                ...order,
                status: update.status, 
                orderItems: updatedOrderItems
              }
            }
            return order
          })
        })

        // Also update the specific order detail cache if it's loaded
        queryClient.setQueryData<OrderDto>(orderKeys.detail(update.orderId), (oldOrder) => {
          if (!oldOrder) return oldOrder

          const updatedOrderItems = oldOrder.orderItems?.map(vo => {
            if (vo.vendorId === update.vendorId) {
              return { ...vo, status: update.status }
            }
            return vo
          })

          return {
            ...oldOrder,
            status: update.status,
            orderItems: updatedOrderItems
          }
        })

        toast.info(`Trạng thái đơn hàng: ${statusLabels[update.status] || update.status}`)

        // Trigger a background refetch to ensure absolute data consistency
        queryClient.invalidateQueries({ queryKey: orderKeys.mine() })
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(update.orderId) })

      } catch (err) {
        console.error('Error parsing WebSocket message', err)
      }
    })

    return () => {
      console.log('Unsubscribing from /topic/customer/' + user.userId)
      subscription.unsubscribe()
    }
  }, [orderClient, isOrderConnected, user, queryClient])
}
