// app/loading.tsx (hoặc app/login/loading.tsx, app/register/loading.tsx)

import { Utensils } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* Icon xoay tròn hoặc hiệu ứng pulse */}
      <div className="relative mb-4">
        {/* Vòng tròn loading bên ngoài */}
        <div className="h-16 w-16 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
        
        {/* Icon nĩa ở giữa đứng yên hoặc hiệu ứng riêng */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Utensils className="h-6 w-6 text-secondary/50" />
        </div>
      </div>
      
      <p className="text-muted-foreground animate-pulse font-medium">
        Đang tải dữ liệu...
      </p>
    </div>
  )
}