'use client'

import { useIsMobile } from '@/hooks/use-mobile'
import { Toaster } from 'sonner'

export function ResponsiveToaster() {
  const isMobile = useIsMobile()
  const position = isMobile ? 'top-center' : 'bottom-right'
  return (
    <div data-toaster-position={position} style={{ display: 'contents' }}>
      {/* key forces Sonner to remount with correct position after useIsMobile settles */}
      <Toaster key={position} richColors position={position} />
    </div>
  )
}
