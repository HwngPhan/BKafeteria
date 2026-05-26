import { OrderDto, OrderStatus } from '@/features/order/config/order.config'
import { create } from 'zustand'

/**
 * Real-time order state store.
 * WebSocket pushes order status updates here.
 * Pages read from this store and merge with their own useState.
 */
interface OrderUpdateEvent {
  orderId: string
  vendorOrderId: string
  vendorId: string
  customerId: string
  status: string
  message?: string
  timestamp: string
}

interface RealtimeOrderStore {
  /** Latest update events from WebSocket, keyed by orderId */
  updates: Map<string, OrderUpdateEvent>
  
  /** Push a new update from WebSocket */
  pushUpdate: (event: OrderUpdateEvent) => void
  
  /** Apply updates to an order list (merge WS state into fetched state) */
  applyUpdates: (orders: OrderDto[]) => OrderDto[]
  
  /** Clear all pending updates (e.g. after a fresh refetch) */
  clearUpdates: () => void
}

export const useRealtimeOrders = create<RealtimeOrderStore>((set, get) => ({
  updates: new Map(),
  
  pushUpdate: (event) => set((state) => {
    const newMap = new Map(state.updates)
    newMap.set(event.orderId, event)
    return { updates: newMap }
  }),
  
  applyUpdates: (orders) => {
    const { updates } = get()
    if (updates.size === 0) return orders
    
    return orders.map((order) => {
      const update = updates.get(order.orderId)
      if (!update) return order
      
      // Update the vendor order status inside the order
      const updatedVendorOrders = order.vendorOrders?.map(vo => {
        if (vo.vendorId === update.vendorId) {
          return { ...vo, status: update.status as OrderStatus }
        }
        return vo
      })

      return {
        ...order,
        status: update.status as OrderStatus,
        vendorOrders: updatedVendorOrders,
      }
    })
  },
  
  clearUpdates: () => set({ updates: new Map() }),
}))
