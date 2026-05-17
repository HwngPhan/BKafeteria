'use client'

import { createContext, useContext, useState } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggle: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle: () => setIsCollapsed(p => !p) }}>
      {children}
    </SidebarContext.Provider>
  )
}
