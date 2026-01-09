"use client";

import { VendorCard } from "@/features/vendor/components/vendor-card";
import { useAuth } from "@/providers/AuthProvider";
import { useMemo } from "react";
import { useGetActiveVendors } from "../data-access/vendor.queries";

export default function CustomerVendorPage() {

  const { data: vendorsData, isLoading: isLoadingVendor, refetch, isRefetching: isRefetchingVendor } = useGetActiveVendors();

  const vendors = useMemo(() => vendorsData || [], [vendorsData]);
  
  const { user, isLoading: isLoadingUser } = useAuth();

  if (isLoadingUser || isLoadingVendor || isRefetchingVendor) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">All Vendors</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.vendorId} className="space-y-3">
            <VendorCard vendor={vendor} role="CUSTOMER" />
          </div>
        ))}
      </div>
    </div>
  );
}
