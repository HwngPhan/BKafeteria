"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useOrderWebSocket } from "@/hooks/useOrderWebSocket";
import { useVendorWebSocket } from "@/hooks/useVendorWebSocket";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Initialize WebSocket connections
  useOrderWebSocket();
  useVendorWebSocket();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isAuthenticated) {
    return <MainLayout>{children}</MainLayout>;
  }

  return null;
}
