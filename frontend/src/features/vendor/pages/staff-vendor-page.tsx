"use client";

import { VendorCard } from "@/features/vendor/components/vendor-card";
import { useAuth } from "@/providers/AuthProvider";
import { useGetMyVendor } from "../data-access/vendor.queries";

export default function StaffVendorPage() {
  const { user, isLoading: isLoadingUser } = useAuth();

  const {data: vendor, isLoading: isLoadingVendor, refetch, isRefetching: isRefetchingVendor} = useGetMyVendor();

  if (isLoadingUser || isLoadingVendor || isRefetchingVendor) return <p>Loading...</p>;

  if (user?.role !== "STAFF") {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Vendor</h1>

      {vendor ? (
        <VendorCard vendor={vendor} role="MANAGER" />
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center space-y-4">
          <p className="text-muted-foreground">
            You haven't joined any vendor yet.
          </p>
        </div>
      )}
    </div>
  );
}
