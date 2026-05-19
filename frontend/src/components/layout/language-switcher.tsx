'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/providers/LanguageProvider'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string;
}

export const ViFlag = ({ className }: { className?: string }) => (
  <span className={cn("flex h-4 w-6 items-center justify-center rounded-[2px] overflow-hidden shadow-sm shrink-0", className)}>
    <svg viewBox="0 0 30 20" className="h-full w-full">
      <rect width="30" height="20" fill="#da251d"/>
      <polygon points="15,4 11.47,14.85 20.71,8.15 9.29,8.15 18.53,14.85" fill="#ffff00"/>
    </svg>
  </span>
)

export const EnFlag = ({ className }: { className?: string }) => (
  <span className={cn("flex h-4 w-6 items-center justify-center rounded-[2px] overflow-hidden shadow-sm shrink-0", className)}>
    <svg viewBox="0 0 60 30" className="h-full w-full">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  </span>
)

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { lang, setLang, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-xl h-10 px-3 font-bold text-xs gap-2 hover:bg-secondary/10 transition-all",
            className
          )}
        >
          {lang === 'vi' ? <ViFlag /> : <EnFlag />}
          <span className="font-bold tracking-tight">{lang.toUpperCase()}</span>
          <ChevronDown size={14} className="opacity-40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-1 w-40 animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuItem 
          onClick={() => setLang('vi')}
          className="rounded-xl cursor-pointer flex items-center justify-between py-2.5 px-3"
        >
          <div className="flex items-center gap-3">
            <ViFlag />
            <span className="font-bold text-xs">{t('common.vi')}</span>
          </div>
          {lang === 'vi' && <Check size={14} className="text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLang('en')}
          className="rounded-xl cursor-pointer flex items-center justify-between py-2.5 px-3"
        >
          <div className="flex items-center gap-3">
            <EnFlag />
            <span className="font-bold text-xs">{t('common.en')}</span>
          </div>
          {lang === 'en' && <Check size={14} className="text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
