import { z } from 'zod'

export const FoodCategorySchema = z.enum(['BEVERAGES', 'PASTRIES', 'SNACKS', 'MEALS', 'DESSERTS'])
export type FoodCategory = z.infer<typeof FoodCategorySchema>

export const MenuItemDtoSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  remaining: z.number(),
  category: FoodCategorySchema,
  rating: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  vendorId: z.string(),
  imageUrl: z.string().optional(),
})
export type MenuItemDto = z.infer<typeof MenuItemDtoSchema>

export const CreateMenuItemRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  remaining: z.number().optional(),
  category: FoodCategorySchema.optional(),
})
export type CreateMenuItemRequest = z.infer<typeof CreateMenuItemRequestSchema>
