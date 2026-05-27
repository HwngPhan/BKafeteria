export interface VoucherDto {
  voucherId: string;
  discountPercentage: number;
  startDate: string; // ISO datetime e.g. "2024-01-01T10:00:00"
  expiryDate: string; // ISO datetime
  vendorId: string;
}

export interface CreateVoucherRequest {
  discountPercentage: number;
  startDate: string;
  expiryDate: string;
}

export interface UpdateVoucherRequest {
  discountPercentage: number;
  startDate: string;
  expiryDate: string;
}

export type VoucherStatus = 'active' | 'upcoming' | 'expired'

export function getVoucherStatus(voucher: VoucherDto): VoucherStatus {
  const now = new Date()
  const start = new Date(voucher.startDate)
  const expiry = new Date(voucher.expiryDate)
  if (now < start) return 'upcoming'
  if (now > expiry) return 'expired'
  return 'active'
}

export function isVoucherValid(voucher: VoucherDto): boolean {
  return getVoucherStatus(voucher) === 'active'
}
