export interface OrderMenuItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface VendorOrderNotification {
  vendorOrderId: string;
  orderId: string;
  vendorId: string;
  customerId: string;
  status: 'PURCHASED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED';
  menuItems: OrderMenuItem[];
  createdAt: string;
  readyAt: string | null;
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
