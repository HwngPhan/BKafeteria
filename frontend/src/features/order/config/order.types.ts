export type OrderStatus = 'PENDING' | 'PURCHASED' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED' | 'CANCELED';

export interface PageDto<T> {
  content: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface VendorOrder {
  vendorId: string;
  vendorName: string;
  menuItems: OrderItem[];
  vendorPrice: number;
}

export interface OrderDto {
  orderId: string;
  status: OrderStatus;
  orderItems: VendorOrder[];
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  customerId: string;
  isDeleted: boolean;
}

export interface CreateOrderRequest {
  vendorOrders: {
    vendorId: string;
    items: {
      itemId: string;
      quantity: number;
    }[];
  }[];
}
