"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
    Home,
    LayoutDashboard,
    ListChecks,
    Menu,
    ShoppingCart,
    Store,
    Users
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const role = user?.role || "CUSTOMER";

  // -------------------------
  // MENU CONFIG THEO ROLE
  // -------------------------
  const menusByRole: Record<string, Array<{
    label: string;
    href: string;
    icon: any;
  }>> = {
    ADMIN: [
      { label: "Homepage", href: "/dashboard", icon: Home },
      { label: "Vendor", href: "/dashboard/vendor", icon: Store },
      { label: "Dashboard", href: "/dashboard/analytics", icon: LayoutDashboard },
      { label: "Users", href: "/dashboard/users", icon: Users },
    ],

    MANAGER: [
      { label: "Homepage", href: "/dashboard", icon: Home },
      { label: "Vendor", href: "/dashboard/vendor", icon: Store },
      { label: "Dashboard", href: "/dashboard/analytics", icon: LayoutDashboard },
      { label: "Staffs", href: "/dashboard/staffs", icon: Users },
    ],

    STAFF: [
      { label: "Homepage", href: "/dashboard", icon: Home },
      { label: "Vendor", href: "/dashboard/vendor", icon: Store },
      { label: "Order process", href: "/dashboard/orders/process", icon: ListChecks },
    ],

    CUSTOMER: [
      { label: "Homepage", href: "/dashboard", icon: Home },
      { label: "Vendor", href: "/dashboard/vendor", icon: Store },
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    ],
  };

  const menuItems = menusByRole[role] ?? [];

  return (
    <>
      {/* ---------------- Mobile Toggle Button ---------------- */}
      <div className="lg:hidden p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold">Dashboard</h2>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebarContent 
              menuItems={menuItems}
              pathname={pathname}
              close={() => setOpen(false)} 
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* ---------------- Desktop Sidebar ---------------- */}
      <aside className="hidden lg:flex w-64 bg-white border-r h-screen p-4">
        <SidebarContent menuItems={menuItems} pathname={pathname} />
      </aside>
    </>
  );
}


/* ------------------------
   Sidebar for Desktop
------------------------ */
function SidebarContent({ menuItems, pathname }: { menuItems: Array<{ label: string; href: string; icon: any }>; pathname: string; }) {
  return (
    <ScrollArea className="h-full">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}


/* ------------------------
   Sidebar for Mobile (Sheet)
------------------------ */
function MobileSidebarContent({ menuItems, pathname, close }: { menuItems: Array<{ label: string; href: string; icon: any }>; pathname: string; close: () => void; }) {
  return (
    <ScrollArea className="h-full p-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
