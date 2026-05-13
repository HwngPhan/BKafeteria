'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/AuthProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { toast } from 'sonner'

export function BalanceCard() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <Card className="relative overflow-hidden rounded-[2.5rem] border-none bg-primary text-white shadow-2xl shadow-primary/30">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium opacity-80 flex items-center gap-2">
          <Wallet size={20} />
          {t('wallet.balance')}
        </CardTitle>
        <TrendingUp size={24} className="opacity-50" />
      </CardHeader>

      <CardContent className="relative space-y-8 py-6">
        <div>
          <span className="text-5xl font-black tracking-tight">
            {user?.balance?.toLocaleString() || '0'}
          </span>
          <span className="ml-2 text-2xl font-bold opacity-70">VNĐ</span>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="secondary" 
            className="flex-1 h-14 rounded-2xl font-bold bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md"
            onClick={() => toast.info(t('wallet.toast_deposit'))}
          >
            <ArrowUpRight className="mr-2 h-5 w-5" /> {t('wallet.deposit')}
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1 h-14 rounded-2xl font-bold bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md"
            onClick={() => toast.info(t('wallet.toast_withdraw'))}
          >
            <ArrowDownLeft className="mr-2 h-5 w-5" /> {t('wallet.withdraw')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
