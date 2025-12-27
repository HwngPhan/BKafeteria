"use client";

import { Button } from "@/components/ui/button";
import { VendorCard } from "@/features/vendor/components/vendor-card";
import { useAuth } from "@/providers/AuthProvider";
import { useMemo } from "react";
import { toast } from "sonner";
import { useApproveVendor, useGetAllVendors } from "../data-access/vendor.queries";

export default function AdminVendorPage() {

  const { user, isLoading: isLoadingUser } = useAuth();

  const { data: vendorsData, isLoading: isLoadingVendor, refetch, isRefetching: isRefetchingVendor } = useGetAllVendors();

  const vendors = useMemo(() => vendorsData || [], [vendorsData]);

  const { mutateAsync: approveVendorMutate } = useApproveVendor();

  const approveVendor = async (vendorId: string) => {
    try {
      await approveVendorMutate(vendorId);
      refetch();
      toast.success("Vendor approved successfully");
    } catch (error: any) {
      toast.error("Error approving vendor:", error);
    }
  };

  if (isLoadingUser || isLoadingVendor || isRefetchingVendor) return <p>Loading...</p>;

  if (user?.role !== "ADMIN") {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">All Vendors</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.vendorId} className="space-y-3">
            <VendorCard vendor={vendor} role="ADMIN" />

            {vendor.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => approveVendor(vendor.vendorId)}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => toast.success("Reject vendor " + vendor.name)}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
