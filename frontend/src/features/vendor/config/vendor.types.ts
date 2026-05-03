export type VendorStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';

export interface VendorDto {
  vendorId: string;
  name: string;
  description: string;
  status: VendorStatus;
  workingHourFrom: string;
  workingHourTo: string;
  certification: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
}

export interface CreateVendorRequest {
  name: string;
  description?: string;
  workingHourFrom?: string;
  workingHourTo?: string;
  certification?: string;
}
