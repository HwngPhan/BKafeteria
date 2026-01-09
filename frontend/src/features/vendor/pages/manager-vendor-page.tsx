"use client";

import { Button } from "@/components/ui/button";
import { VendorCard } from "@/features/vendor/components/vendor-card";
import { useAuth } from "@/providers/AuthProvider";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateVendorDialog } from "../components/create-vendor-dialog";
import { VendorDto } from "../config/vendor.config";
import { useGetMyVendor, useRegisterVendor } from "../data-access/vendor.queries";

export default function ManagerVendorPage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {data: vendor, isLoading: isLoadingVendor, refetch, isRefetching: isRefetchingVendor} = useGetMyVendor();

  const { mutateAsync: registerVendorMutate } = useRegisterVendor();

  if (isLoadingUser || isLoadingVendor || isRefetchingVendor) return <p>Loading...</p>;

  if (user?.role !== "MANAGER") {
    return <p>You do not have permission to view this page.</p>;
  }

  const handleVendorConfirm = async (data: VendorDto) => {
    setIsCreating(true);
    try {
      await registerVendorMutate(data);
      toast.success("Vendor created successfully");
      refetch();
      setOpenCreate(false);
    } catch (error: any) {
      toast.error("Error creating vendor:", error);
    } finally {
      setIsCreating(false);
    }
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
        isCreating={isCreating}
        onSubmit={handleVendorConfirm}
      />
    </div>
  );
}
