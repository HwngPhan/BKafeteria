"use client";

import { Button } from "@/components/ui/button";
import { VendorCard } from "@/features/vendor/components/vendor-card";
import { VendorEntity } from "@/features/vendor/config/vendor.config";
import { useAuth } from "@/providers/AuthProvider";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateVendorDialog } from "../components/create-vendor-dialog";
import { GetMyVendorApi } from "../data-access/vendor.api";

export default function ManagerVendorPage() {
  const [vendor, setVendor] = useState<VendorEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);

  const fetchVendor = () => {
    setLoading(true);
    GetMyVendorApi()
      .then((data) => setVendor(data ?? null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchVendor();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (user?.role !== "MANAGER") {
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
            You haven't created any vendor yet.
          </p>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Vendor
          </Button>
        </div>
      )}

      <CreateVendorDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={fetchVendor}
      />
    </div>
  );
}
