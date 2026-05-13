"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../loading";


import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-6 z-50">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}
