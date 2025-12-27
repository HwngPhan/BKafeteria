"use client";


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { VendorDto } from "@/features/vendor/config/vendor.config";
import { useState } from "react";

interface CreateVendorDialogProps {
  open: boolean;
  isCreating: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: VendorDto) => void;
}

export function CreateVendorDialog({
  open,
  onOpenChange,
  isCreating,
  onSubmit,
}: CreateVendorDialogProps) {

  const [formData, setFormData] = useState<VendorDto>({
    name: "",
    description: "",
    workingHourFrom: "",
    workingHourTo: "",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Vendor</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
        >
          {/* Vendor name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Vendor name</label>
            <Input
              placeholder="Canteen A"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Best noodles in campus"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* Working hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Open</label>
              <Input
                type="time"
                value={formData.workingHourFrom}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    workingHourFrom: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Close</label>
              <Input
                type="time"
                value={formData.workingHourTo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    workingHourTo: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit"
              disabled={isCreating || !formData.name || !formData.workingHourFrom || !formData.workingHourTo}
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
