"use client";

import { VendorCard } from "@/features/vendor/components/vendor-card";
import { VendorEntity } from "@/features/vendor/config/vendor.config";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { GetMyVendorApi } from "../data-access/vendor.api";

export default function StaffVendorPage() {
  const [vendor, setVendor] = useState<VendorEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    GetMyVendorApi()
      .then((data) => setVendor(data ?? null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

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
