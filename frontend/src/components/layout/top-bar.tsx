'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useLogout } from '@/features/auth/data-access/auth.queries'
import { CartSheet } from '@/features/cart/components/CartSheet'
import { useAuth } from '@/providers/AuthProvider'
import { Bell, Search } from 'lucide-react'

export function TopBar() {
  const { user } = useAuth()
  const { mutateAsync: logout } = useLogout()

  return (
    <header className="fixed top-0 right-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/60 backdrop-blur-xl px-6 md:left-auto md:w-[calc(100%-16rem)] transition-all duration-300">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm món ăn, cửa hàng..."
            className="h-10 w-full rounded-full bg-secondary/5 pl-10 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Cart */}
        <CartSheet />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary/10">
          <Bell size={22} className="text-foreground/80" />
          <div className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg cursor-pointer">
              Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer">
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-lg cursor-pointer text-red-500 focus:text-red-500"
              onClick={() => logout()}
            >
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
