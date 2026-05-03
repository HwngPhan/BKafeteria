"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../loading";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // MOVED UP: Gọi usePathname ở đây để đảm bảo nó luôn được gọi trong mọi lần render
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <Loading />
  }


  if (!isLoading && isAuthenticated) {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    )
  }

  return null;
}