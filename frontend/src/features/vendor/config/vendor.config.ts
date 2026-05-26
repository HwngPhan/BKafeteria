import { z } from 'zod'

export const VendorStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CLOSED'])
export type VendorStatus = z.infer<typeof VendorStatusSchema>

export const VendorDtoSchema = z.object({
  vendorId: z.string(),
  name: z.string(),
  description: z.string(),
  status: VendorStatusSchema,
  workingHourFrom: z.string(),
  workingHourTo: z.string(),
  certification: z.string(),
  managerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  approvedBy: z.string().nullable(),
  imgUrl: z.string().optional(),
})
export type VendorDto = z.infer<typeof VendorDtoSchema>

export const CreateVendorRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  workingHourFrom: z.string().optional(),
  workingHourTo: z.string().optional(),
  certification: z.string().optional(),
})
export type CreateVendorRequest = z.infer<typeof CreateVendorRequestSchema>

export const DishFrequencySchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  totalQuantity: z.number(),
})
export type DishFrequency = z.infer<typeof DishFrequencySchema>

export const VendorDashboardDtoSchema = z.object({
  vendorId: z.string(),
  vendorName: z.string(),
  todayIncome: z.number(),
  weekIncome: z.number(),
  monthIncome: z.number(),
  totalOrders: z.number(),
  completedOrders: z.number(),
  canceledOrders: z.number(),
  pendingOrders: z.number(),
  processingOrders: z.number(),
  purchasedOrders: z.number(),
  averageOrderValue: z.number(),
  averagePrepTimeMinutes: z.number(),
  topDishes: z.array(DishFrequencySchema),
})
export type VendorDashboardDto = z.infer<typeof VendorDashboardDtoSchema>
