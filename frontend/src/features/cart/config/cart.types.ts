export interface CartItem {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
  imageUrl?: string;
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemsByVendor: () => Record<string, CartItem[]>;
}
