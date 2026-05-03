import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, CartStore } from '../config/cart.types'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.itemId === item.itemId)

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.itemId === item.itemId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...currentItems, item] })
        }
      },

      removeItem: (itemId) => {
        set({
          items: get().items.filter((i) => i.itemId !== itemId),
        })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.itemId === itemId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemsByVendor: () => {
        const items = get().items
        return items.reduce((acc, item) => {
          if (!acc[item.vendorId]) {
            acc[item.vendorId] = []
          }
          acc[item.vendorId].push(item)
          return acc
        }, {} as Record<string, CartItem[]>)
      },
    }),
    {
      name: 'bkafeteria-cart',
    }
  )
)
