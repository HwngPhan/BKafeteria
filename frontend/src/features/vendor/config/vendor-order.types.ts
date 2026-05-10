export interface VendorOrderNotification {
  vendorOrderId: string;
  orderId: string;
  vendorId: string;
  status: 'PENDING' | 'PROCESSING' | 'FINISHED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}
