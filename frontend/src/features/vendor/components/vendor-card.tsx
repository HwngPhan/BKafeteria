"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VendorEntity } from "@/features/vendor/config/vendor.config";
import { Clock } from "lucide-react";
import Image from "next/image";
import { vendorStatusMap } from "./vendor-status";

interface VendorCardProps {
  vendor: VendorEntity;
  role?: string;
}

export function VendorCard({ vendor, role = "user" }: VendorCardProps) {
  const showStatus =
    role === "STAFF" || role === "MANAGER" || role === "ADMIN";

  const statusConfig = vendorStatusMap[vendor.status];

  return (
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-40 w-full">
        <Image
          src="/placeholder-food.jpg" // bạn để tạm trong /public
          alt={vendor.name}
          fill
          className="object-cover"
        />

        {showStatus && (
          <Badge
            variant={statusConfig.variant}
            className="absolute top-2 right-2"
          >
            {statusConfig.label}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold leading-none">
          {vendor.name}
        </h3>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {vendor.description && (
          <p className="line-clamp-2">{vendor.description}</p>
        )}

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {vendor.workingHourFrom} – {vendor.workingHourTo}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
