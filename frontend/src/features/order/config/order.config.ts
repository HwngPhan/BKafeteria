import { z } from 'zod'

export const OrderStatusSchema = z.enum(['PENDING', 'PURCHASED', 'PROCESSING', 'COMPLETED', 'DELIVERED', 'CANCELED'])
export type OrderStatus = z.infer<typeof OrderStatusSchema>

export const OrderItemSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  quantity: z.number(),
  price: z.number(),
})
export type OrderItem = z.infer<typeof OrderItemSchema>

export const VendorOrderSchema = z.object({
  vendorOrderId: z.string(),
  orderId: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  status: OrderStatusSchema,
  orderItems: z.array(OrderItemSchema),
  vendorPrice: z.number(),
})
export type VendorOrder = z.infer<typeof VendorOrderSchema>

export const OrderDtoSchema = z.object({
  orderId: z.string(),
  status: OrderStatusSchema,
  vendorOrders: z.array(VendorOrderSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  totalPrice: z.number(),
  customerId: z.string(),
  isDeleted: z.boolean(),
})
export type OrderDto = z.infer<typeof OrderDtoSchema>

export const CreateOrderRequestSchema = z.object({
  vendorOrders: z.array(
    z.object({
      vendorId: z.string(),
      items: z.array(
        z.object({
          itemId: z.string(),
          quantity: z.number(),
        })
      ),
    })
  ),
})
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>

export const PageDtoSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    isLast: z.boolean(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  })

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
