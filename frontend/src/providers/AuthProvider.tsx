"use client";

import { usePathname } from "next/navigation";
import { User } from "@/features/user/config/user.config"; // bạn đã có
import { useGetMe } from "@/features/user/data-access/user.queries";
import { createContext, useContext, useEffect, useState } from "react";

// -------------------------------
// TYPES
// -------------------------------

// State exposed from AuthContext
export interface AuthContextState {
  user: User | null | undefined;              // undefined = query chưa trả về, null = chưa login
  isAuthenticated: boolean;                   // user != null
  isUnauthenticated: boolean;                 // error 401
  isLoading: boolean;                         // query loading
}

// -------------------------------
// CONTEXT
// -------------------------------

const AuthContext = createContext<AuthContextState | null>(null);

// -------------------------------
// PROVIDER
// -------------------------------

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  // Don't run getMe on landing page unless manually triggered (not implemented here as requested)
  const isLandingPage = pathname === "/";
  const { data: user, error, isLoading: queryLoading } = useGetMe(!isLandingPage);

  const [delayDone, setDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDelayDone(true), 1200); // 1.2s
    return () => clearTimeout(timer);
  }, []);

  const isLoading = !isLandingPage && (queryLoading || !delayDone);

  const isAuthenticated = !!user;
  const isUnauthenticated = error?.message === "UNAUTHENTICATED";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isUnauthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// -------------------------------
// HOOK
// -------------------------------

export const useAuth = (): AuthContextState => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
};
