"use client";

import { CartFloatingButton, CartProvider } from "@/components/cart/cart-providers";
import { useAuth } from "@/providers/AuthProvider";
import { Home, Store, User, Utensils } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../loading";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // MOVED UP: Gọi usePathname ở đây để đảm bảo nó luôn được gọi trong mọi lần render
  const pathname = usePathname();

  // Điều kiện return nằm SAU tất cả các hooks
  if (isLoading) {
    return <Loading />
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router])

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/menu", icon: Utensils, label: "Menu" },
    { href: "/vendors", icon: Store, label: "Vendors" },
    { href: "/profile", icon: User, label: "Tôi" },
  ]

  if (!isLoading && isAuthenticated) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-background pb-24 relative">
          {/* Main Content */}
          <main>{children}</main>

          {/* Floating Cart */}
          <CartFloatingButton />

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-secondary/20 h-20 px-6 flex items-center justify-between z-40 pb-2">
            {navItems.map((item) => {
              // Đảm bảo so sánh chính xác đường dẫn (có thể cần startsWith nếu có sub-routes)
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
                  <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-secondary/10 text-secondary" : "text-muted-foreground"}`}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-secondary" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </CartProvider>
    )
  }

  return null;
}