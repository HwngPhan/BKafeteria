"use client";

import { useLogout } from "@/features/auth/data-access/auth.queries";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function TopNavBar() {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  const userInitial =
    user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="w-full border-b bg-white h-16 flex items-center">
      <div className="container mx-auto flex items-center justify-between px-2">

        {/* LEFT — LOGO hoặc ICON */}
        <Link href="/" className="font-semibold text-xl tracking-wide">
          <Image
            src="/logo_blue.png"
            alt="Logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </Link>

        {/* RIGHT — USER DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="cursor-pointer">
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/user-settings">User Settings</Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 font-semibold"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};
