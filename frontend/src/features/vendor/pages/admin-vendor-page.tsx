"use client";

import { Button } from "@/components/ui/button";
import { VendorCard } from "@/features/vendor/components/vendor-card";
import { VendorEntity } from "@/features/vendor/config/vendor.config";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { approveVendorApi } from "../data-access/vendor.api";

export default function AdminVendorPage() {
  const [vendors, setVendors] = useState<VendorEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then(setVendors)
      .finally(() => setLoading(false));
  }, []);

  const approveVendor = async (id: string) => {
    await approveVendorApi(id);
    setVendors((prev) =>
      prev.map((v) =>
        v.vendorId === id ? { ...v, status: "ACCEPTED" } : v
      )
    );
  };

  const rejectVendor = async (id: string) => {
    await fetch(`/api/vendors/${id}/reject`, { method: "PATCH" });
    setVendors((prev) =>
      prev.map((v) =>
        v.vendorId === id ? { ...v, status: "REJECTED" } : v
      )
    );
  };

  if (loading) return <p>Loading...</p>;

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
                  onClick={() => rejectVendor(vendor.vendorId)}
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
