'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLogout } from '@/features/auth/data-access/auth.queries'
import { CartSheet } from '@/features/cart/components/CartSheet'
import { useVendorOrderNotifications } from '@/features/vendor/data-access/vendor-order.queries'
import { useAuth } from '@/providers/AuthProvider'
import { Bell, Info, Settings, ShoppingBag, User as UserIcon, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function TopBar() {
  const { user } = useAuth()
  const { mutateAsync: logout } = useLogout()
  const router = useRouter()

  const isManager = user?.role === 'MANAGER' || user?.role === 'STAFF'
  const { data: notifications } = useVendorOrderNotifications()
  const pendingNotifications = notifications?.filter(n => n.status !== 'FINISHED' && n.status !== 'CANCELLED') || []

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="fixed top-0 right-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/60 backdrop-blur-xl px-6 md:left-auto md:w-[calc(100%-16rem)] transition-all duration-300">
      <div className="flex flex-1 items-center gap-4">
      </div>

      <div className="flex items-center gap-4">
        {/* Cart */}
        <CartSheet />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary/10">
              <Bell size={22} className="text-foreground/80" />
              {pendingNotifications.length > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] font-bold bg-red-500 text-white border-2 border-background">
                  {pendingNotifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-white p-0 overflow-hidden" align="end">
            <DropdownMenuLabel className="p-4 border-b">
              <div className="flex items-center justify-between">
                <span className="font-bold">Thông báo</span>
                {isManager && <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter">Nhà bán hàng</Badge>}
              </div>
            </DropdownMenuLabel>
            <ScrollArea className="h-[300px]">
              {pendingNotifications.length > 0 ? (
                <div className="flex flex-col">
                  {pendingNotifications.map((notif) => (
                    <div key={notif.vendorOrderId} className="p-4 border-b hover:bg-secondary/5 cursor-pointer transition-colors">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <ShoppingBag size={18} className="text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold leading-none text-primary">Đơn hàng mới!</p>
                          <p className="text-xs text-muted-foreground">Đơn #{notif.orderId.substring(0, 8)} đang chờ xử lý.</p>
                          <p className="text-[10px] text-muted-foreground/60">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 space-y-2">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Info size={24} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Không có thông báo mới nào</p>
                </div>
              )}
            </ScrollArea>
            <div className="p-2 border-t bg-secondary/5">
              <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary hover:bg-white" asChild>
                <Link href={isManager ? "/manager/vendor" : "/orders"}>Xem tất cả</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

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
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/wallet" className="flex items-center w-full">
                <Wallet size={16} className="mr-2 text-primary" />
                Ví tiền
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/user-settings" className="flex items-center w-full">
                <UserIcon size={16} className="mr-2 text-primary" />
                Hồ sơ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/user-settings" className="flex items-center w-full">
                <Settings size={16} className="mr-2 text-primary" />
                Cài đặt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-lg cursor-pointer text-red-500 focus:text-red-500"
              onClick={handleLogout}
            >
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
