'use client'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/providers/LanguageProvider'

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      className={`rounded-full h-9 px-3 font-bold text-xs gap-1.5 hover:bg-secondary/10 ${className}`}
    >
      <span className="text-base leading-none">{lang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
      {lang === 'vi' ? 'VI' : 'EN'}
    </Button>
  )
}
