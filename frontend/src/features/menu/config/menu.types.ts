export type FoodCategory = 'BEVERAGES' | 'PASTRIES' | 'SNACKS' | 'MEALS' | 'DESSERTS';

export interface MenuItemDto {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  remaining: number;
  category: FoodCategory;
  rating: number;
  createdAt: string;
  updatedAt: string;
  vendorId: string;
  imageUrl?: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  remaining?: number;
  category?: string;
}
