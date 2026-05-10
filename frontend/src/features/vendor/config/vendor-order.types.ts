export interface VendorOrderNotification {
  vendorOrderId: string;
  orderId: string;
  vendorId: string;
  status: 'PURCHASED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
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
