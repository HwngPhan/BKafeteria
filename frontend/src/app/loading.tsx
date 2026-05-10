"use client"

import { Utensils } from "lucide-react"
import { useLanguage } from "@/providers/LanguageProvider"

export default function Loading() {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative mb-4">
        <div className="h-16 w-16 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Utensils className="h-6 w-6 text-secondary/50" />
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse font-medium">{t('loading.text')}</p>
    </div>
  )
}
