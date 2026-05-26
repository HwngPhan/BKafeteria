import { z } from 'zod'

export const CartItemSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  price: z.number(),
  quantity: z.number(),
  vendorId: z.string(),
  vendorName: z.string(),
  imageUrl: z.string().optional(),
})
export type CartItem = z.infer<typeof CartItemSchema>

export interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getItemsByVendor: () => Record<string, CartItem[]>
}
