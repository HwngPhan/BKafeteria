"use client";

import { VendorCard } from "@/features/vendor/components/vendor-card";
import { VendorEntity } from "@/features/vendor/config/vendor.config";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";

export default function CustomerVendorPage() {
  const [vendors, setVendors] = useState<VendorEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then(setVendors)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

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
