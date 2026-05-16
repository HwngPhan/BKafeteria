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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { useLogout } from '@/features/auth/data-access/auth.queries'
import { CartSheet } from '@/features/cart/components/CartSheet'
import { useVendorOrderNotifications } from '@/features/vendor/data-access/vendor-order.queries'
import { useCustomerNotifications } from '@/hooks/useCustomerNotifications'
import { useManagerNotifications } from '@/hooks/useManagerNotifications'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/AuthProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import {
  Bell,
  ClipboardList,
  Home,
  Info,
  Menu,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  User as UserIcon,
  Users,
  Utensils,
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { EnFlag, ViFlag } from './language-switcher'

export function TopBar() {
  const { user } = useAuth()
  const { mutateAsync: logout } = useLogout()
  const router = useRouter()
  const pathname = usePathname()
  const { lang, setLang, t } = useLanguage()

  const navItems = [
    { href: '/dashboard', icon: Home, labelKey: 'nav.overview', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'] },
    { href: '/vendors', icon: Store, labelKey: 'nav.stores', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'] },
    { href: '/menu', icon: Utensils, labelKey: 'nav.menu', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'] },
    { href: '/orders', icon: ClipboardList, labelKey: 'nav.orders', roles: ['CUSTOMER'] },
    { href: '/wallet', icon: Wallet, labelKey: 'nav.wallet', roles: ['CUSTOMER'] },

    // Manager routes
    { href: '/manager/orders', icon: ClipboardList, labelKey: 'nav.manage_orders', roles: ['MANAGER', 'STAFF'] },
    { href: '/manager/vendor', icon: Settings, labelKey: 'nav.manage_store', roles: ['MANAGER'] },
    { href: '/manager/menu', icon: Utensils, labelKey: 'nav.manage_menu', roles: ['MANAGER'] },

    // Admin routes
    { href: '/admin/users', icon: Users, labelKey: 'nav.manage_users', roles: ['ADMIN'] },
    { href: '/admin/vendors', icon: ShieldCheck, labelKey: 'nav.approve_stores', roles: ['ADMIN'] },
  ]

  const isManager = user?.role === 'MANAGER' || user?.role === 'STAFF'
  const { data: notifications } = useVendorOrderNotifications(isManager)
  const pendingNotifications = notifications?.filter(n => n.status !== 'COMPLETED' && n.status !== 'CANCELED') || []
  const { markAsRead: markManagerAsRead, isRead: isManagerRead } = useManagerNotifications()
  const unreadManagerNotifications = pendingNotifications.filter(n => !isManagerRead(n.vendorOrderId))
  
  const customerNotifs = useCustomerNotifications(state => state.notifications)
  const unreadCustomerCount = useCustomerNotifications(state => state.getUnreadCount())
  const markAsRead = useCustomerNotifications(state => state.markAsRead)
  const markAllCustomerAsRead = useCustomerNotifications(state => state.markAllAsRead)


  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="fixed top-0 right-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/60 backdrop-blur-xl px-4 md:px-6 md:left-auto md:w-[calc(100%-16rem)] transition-all duration-300">
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl hover:bg-secondary/10">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-none shadow-2xl">
            <SheetHeader className="p-6 border-b text-left">
              <SheetTitle className="text-xl font-black tracking-tight text-primary">
                BK<span className="text-foreground">AFETERIA</span>
              </SheetTitle>
              {user && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/10 text-primary border-none">
                    {t(`role.${user.role.toLowerCase()}`)}
                  </Badge>
                </div>
              )}
            </SheetHeader>
            <div className="flex flex-col h-[calc(100vh-5rem)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-1.5">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    if (item.roles && user && !item.roles.includes(user.role)) return null

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 group',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold'
                            : 'text-muted-foreground hover:bg-secondary/10 hover:text-primary'
                        )}
                      >
                        <item.icon
                          size={20}
                          className={cn(
                            'transition-transform duration-200 group-hover:scale-110',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          )}
                        />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    )
                  })}
                </div>
              </ScrollArea>
              
              <div className="p-6 border-t bg-secondary/5 mt-auto">
                <Button
                  variant="outline"
                  onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                  className="w-full h-14 justify-between rounded-2xl border-secondary/20 hover:bg-white hover:shadow-xl transition-all gap-3 px-5 group"
                >
                  <div className="flex items-center gap-3">
                    {lang === 'vi' ? <ViFlag /> : <EnFlag />}
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-bold text-foreground">{lang === 'vi' ? t('common.vi') : t('common.en')}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('common.switch_lang')}</span>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Cart */}
        <CartSheet />

        {/* Manager Notifications */}
        {isManager && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative border-1 border-slate-400 rounded-xl hover:bg-secondary/10">
                <Bell size={22} className="text-foreground/80" />
                {unreadManagerNotifications.length > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] font-bold bg-red-500 text-white border-2 border-background">
                    {unreadManagerNotifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-white p-0 overflow-hidden" align="end">
              <DropdownMenuLabel className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{t('topbar.notifications')}</span>
                  {isManager && <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter">{t('topbar.vendor_badge')}</Badge>}
                </div>
              </DropdownMenuLabel>
              <ScrollArea className="h-[300px]">
                {pendingNotifications.length > 0 ? (
                  <div className="flex flex-col">
                    {pendingNotifications.map((notif) => {
                      const isRead = isManagerRead(notif.vendorOrderId)
                      return (
                        <div 
                          key={notif.vendorOrderId} 
                          className={cn(
                            "p-4 border-b hover:bg-secondary/5 cursor-pointer transition-colors",
                            isRead ? "opacity-60" : "bg-primary/5"
                          )}
                          onClick={() => {
                            markManagerAsRead(notif.vendorOrderId)
                            router.push('/manager/orders')
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                              isRead ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                            )}>
                              <ShoppingBag size={18} />
                            </div>
                            <div className="space-y-1">
                              <p className={cn("text-sm leading-none", isRead ? "font-medium" : "font-bold text-primary")}>
                                {t('topbar.new_order')}
                              </p>
                              <p className="text-xs text-muted-foreground">#{notif.orderId.substring(0, 8)} {t('topbar.order_pending')}</p>
                              <p className="text-[10px] text-muted-foreground/60">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 space-y-2">
                    <div className="p-3 rounded-full bg-secondary/10">
                      <Info size={24} className="text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{t('topbar.no_notifications')}</p>
                  </div>
                )}
              </ScrollArea>
              <div className="p-2 border-t bg-secondary/5">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary hover:bg-white" asChild>
                  <Link href="/manager/vendor">{t('topbar.view_all')}</Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Customer Notifications */}
        {!isManager && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative border-1 border-slate-400 rounded-xl hover:bg-secondary/10">
                <Bell size={22} className="text-foreground/80" />
                {unreadCustomerCount > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] font-bold bg-red-500 text-white border-2 border-background">
                    {unreadCustomerCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-white p-0 overflow-hidden shadow-xl" align="end">
              <DropdownMenuLabel className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{t('topbar.notifications')}</span>
                  {unreadCustomerCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-6 px-2 font-bold text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.preventDefault()
                        markAllCustomerAsRead()
                      }}
                    >
                      {t('topbar.mark_all_read')}
                    </Button>
                  )}
                </div>
              </DropdownMenuLabel>
              <ScrollArea className="h-[300px]">
                {customerNotifs.length > 0 ? (
                  <div className="flex flex-col">
                    {customerNotifs.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 border-b hover:bg-secondary/5 cursor-pointer transition-colors ${notif.isRead ? 'opacity-60' : 'bg-primary/5'}`}
                        onClick={() => {
                          markAsRead(notif.id);
                          router.push('/orders/' + notif.orderId);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                            <ShoppingBag size={18} />
                          </div>
                          <div className="space-y-1">
                            <p className={`text-sm leading-none ${notif.isRead ? 'font-medium' : 'font-bold'}`}>{notif.message}</p>
                            {/* <p className="text-xs text-muted-foreground">Đơn hàng #{notif.vendorOrderId?.substring(0, 8)}</p> */}
                            <p className="text-[10px] text-muted-foreground/60">{new Date(notif.timestamp).toLocaleTimeString()}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">{t('topbar.no_notifications')}</p>
                  </div>
                )}
              </ScrollArea>
              <div className="p-2 border-t bg-secondary/5">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary hover:bg-white" asChild>
                  <Link href="/orders">{t('topbar.view_all')}</Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
          <DropdownMenuContent className="w-72 p-0 rounded-2xl shadow-2xl border-0 overflow-hidden bg-background" align="end" forceMount>
            
            {/* Wallet Integration Section */}
            <div className="bg-gradient-to-br from-primary to-indigo-700 p-5 text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
              
              <div className="relative z-10 flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 border-2 border-white/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`} />
                  <AvatarFallback className="bg-primary/20 text-primary-foreground">
                    {user?.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-base font-bold leading-none">{user?.fullName}</span>
                  <span className="text-xs text-primary-foreground/70">{user?.email}</span>
                </div>
              </div>
              
              <div className="relative z-10 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-primary-foreground/70 uppercase tracking-wider font-semibold">{t('topbar.balance')}</span>
                  <Wallet size={14} className="text-primary-foreground/80" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{(user?.balance ?? 0).toLocaleString('vi-VN')}</span>
                  <span className="text-sm font-medium text-primary-foreground/80">đ</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-card">
              <div className="flex items-center justify-between p-2 mx-1 mt-1 mb-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-amber-500/20 rounded-full">
                    <Star size={12} className="text-amber-600 fill-amber-600" />
                  </div>
                  <span className="text-xs font-semibold text-amber-700">{t('topbar.points')}</span>
                </div>
                <span className="text-sm font-bold text-amber-600">{(user?.points ?? 0).toLocaleString('vi-VN')}</span>
              </div>

              <div className="px-1 space-y-1">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                  <Link href="/wallet" className="flex items-center w-full">
                    <Wallet size={16} className="mr-2 text-primary" />
                    {t('topbar.wallet')}
                    <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary hover:bg-primary/20">{t('topbar.topup_short')}</Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                  <Link href="/profile" className="flex items-center w-full">
                    <UserIcon size={16} className="mr-2 text-primary" />
                    {t('topbar.profile')}
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                  <Link href="/profile" className="flex items-center w-full">
                    <Settings size={16} className="mr-2 text-primary" />
                    {t('topbar.settings')}
                  </Link>
                </DropdownMenuItem> */}
              </div>

              <DropdownMenuSeparator className="my-2" />
              <div className="px-1">
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 py-2.5"
                  onClick={handleLogout}
                >
                  {t('topbar.logout')}
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
