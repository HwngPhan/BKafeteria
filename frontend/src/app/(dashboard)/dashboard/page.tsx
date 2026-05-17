"use client"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const firstName = user?.fullName?.split(' ').pop() || 'bạn'

  const hour = new Date().getHours()
  const greetingKey = hour < 12
    ? 'dashboard.greeting_morning'
    : hour < 18
      ? 'dashboard.greeting_afternoon'
      : 'dashboard.greeting_evening'

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="p-6">
        <h1 className="text-6xl font-black tracking-tight text-primary">
          {t(greetingKey)}, {firstName}!
        </h1>
      </div>
      <p className="text-muted-foreground text-xl font-medium">{t('dashboard.question')}</p>
      <div className="flex gap-4 pt-8">
        <Button asChild className="rounded-2xl h-14 px-8 font-bold text-lg shadow-xl shadow-primary/20">
          <a href="/vendors">{t('dashboard.explore_stores')}</a>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl h-14 px-8 font-bold text-lg border-secondary/20 hover:bg-secondary/5">
          <a href="/menu">{t('dashboard.view_menu')}</a>
        </Button>
      </div>
    </div>
  )
}
