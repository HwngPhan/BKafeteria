export type OrderStatus = 'PENDING' | 'PURCHASED' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED' | 'CANCELED';

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface VendorOrder {
  vendorOrderId: string;
  orderId: string;
  vendorId: string;
  vendorName: string;
  status: OrderStatus;
  orderItems: OrderItem[];
  vendorPrice: number;
}

export interface OrderDto {
  orderId: string;
  status: OrderStatus;
  vendorOrders: VendorOrder[];
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
