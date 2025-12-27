'use client'

import AdminVendorPage from "@/features/vendor/pages/admin-vendor-page";
import CustomerVendorPage from "@/features/vendor/pages/customer-vendor-page";
import ManagerVendorPage from "@/features/vendor/pages/manager-vendor-page";
import StaffVendorPage from "@/features/vendor/pages/staff-vendor-page";
import { useAuth } from "@/providers/AuthProvider";

export default function VendorPage() {
    const { user } = useAuth();

    if (user?.role === "ADMIN") return <AdminVendorPage />;

    if (user?.role === "MANAGER") return <ManagerVendorPage />;

    if (user?.role === "STAFF") return <StaffVendorPage />;

    return <CustomerVendorPage />;
}