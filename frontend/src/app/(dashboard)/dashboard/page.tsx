"use client"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/AuthProvider"

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ').pop() || 'bạn'

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="p-6">
        <h1 className="text-6xl font-black tracking-tight text-primary">Chào buổi sáng, {firstName}! 👋</h1>
      </div>
      <p className="text-muted-foreground text-xl font-medium">Bạn muốn ăn gì hôm nay?</p>
      <div className="flex gap-4 pt-8">
        <Button asChild className="rounded-2xl h-14 px-8 font-bold text-lg shadow-xl shadow-primary/20">
          <a href="/vendors">Khám phá cửa hàng</a>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl h-14 px-8 font-bold text-lg border-secondary/20 hover:bg-secondary/5">
          <a href="/menu">Xem thực đơn</a>
        </Button>
      </div>
    </div>
  )
}