'use client'

import { SideNav } from './side-nav'
import { TopBar } from './top-bar'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#fafbfc]">
      <SideNav />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 ease-in-out">
        <TopBar />
        <main className="flex-1 p-6 mt-16 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Nav Overlay (Optional/Future) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 flex items-center justify-around px-4">
        {/* Simplified mobile nav can be added here */}
      </div>
    </div>
  )
}
