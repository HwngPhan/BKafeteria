"use client";

import Sidebar from "@/components/layout/sidebar";
import TopNavBar from "@/components/layout/top-nav-bar";
import { PageLoading } from "@/components/loading";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ---- Top Navbar ---- */}
      <TopNavBar />

      {/* ---- Main layout: sidebar + content ---- */}
      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-64 border-r h-[calc(100vh-64px)] sticky top-16">
          <Sidebar />
        </aside>

        {/* Content */}
          {children}

      </div>
    </div>
  );
}
