// vendor-status.ts
import { VendorStatus } from "@/features/vendor/config/vendor.config";

export const vendorStatusMap: Record<
  VendorStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: {
    label: "Pending",
    variant: "outline",
  },
  ACCEPTED: {
    label: "Accepted",
    variant: "default",
  },
  REJECTED: {
    label: "Rejected",
    variant: "destructive",
  },
  CLOSED: {
    label: "Closed",
    variant: "secondary",
  },
};
