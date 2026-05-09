'use client'

import { cn } from '@/lib/utils'
import {
  Home,
  Store,
  Utensils,
  Wallet,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/AuthProvider'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Tổng quan', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'] },
  { href: '/vendors', icon: Store, label: 'Cửa hàng', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'] },
  { href: '/menu', icon: Utensils, label: 'Thực đơn', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'] },
  { href: '/orders', icon: ClipboardList, label: 'Đơn hàng', roles: ['CUSTOMER'] },
  
  // Manager routes
  { href: '/manager/vendor', icon: Settings, label: 'Quản lý cửa hàng', roles: ['MANAGER'] },
  { href: '/manager/menu', icon: Utensils, label: 'Quản lý thực đơn', roles: ['MANAGER'] },
  { href: '/manager/staff', icon: Users, label: 'Quản lý nhân viên', roles: ['MANAGER'] },
  
  // Admin routes
  { href: '/admin/users', icon: Users, label: 'Quản lý người dùng', roles: ['ADMIN'] },
  { href: '/admin/vendors', icon: ShieldCheck, label: 'Duyệt cửa hàng', roles: ['ADMIN'] },
]

export function SideNav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useAuth()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background/80 backdrop-blur-xl transition-all duration-300 ease-in-out hidden md:flex flex-col',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b">
        {!isCollapsed && (
          <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-foreground">
            BK<span className="text-primary">AFETERIA</span>
          </span>
          {user && (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              {user.role}
            </span>
          )}
        </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          if (item.roles && user && !item.roles.includes(user.role)) return null
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:bg-secondary/10 hover:text-secondary'
              )}
            >
              <item.icon
                size={22}
                className={cn(
                  'transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

    </aside>
  )
}
