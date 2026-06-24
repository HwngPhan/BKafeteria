import { z } from 'zod'

export const VendorOrderNotificationStatusSchema = z.enum([
  'PENDING',
  'PURCHASED',
  'PROCESSING',
  'COMPLETED',
  'CANCELED',
])
export type VendorOrderNotificationStatus = z.infer<typeof VendorOrderNotificationStatusSchema>

export const OrderMenuItemSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  quantity: z.number(),
  price: z.number(),
})
export type OrderMenuItem = z.infer<typeof OrderMenuItemSchema>

export const VendorOrderNotificationSchema = z.object({
  vendorOrderId: z.string(),
  orderId: z.string(),
  vendorId: z.string(),
  customerId: z.string(),
  status: VendorOrderNotificationStatusSchema,
  menuItems: z.array(OrderMenuItemSchema),
  createdAt: z.string(),
  readyAt: z.string().nullable(),
})
export type VendorOrderNotification = z.infer<typeof VendorOrderNotificationSchema>

export type PageDto<T> = {
  content: T[]
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
  isLast: boolean
  hasNextPage: boolean
  hasPreviousPage: boolean
}
