'use client'

import { useMyOrders } from '@/features/order/data-access/order.queries'
import { OrderCard } from '@/features/order/components/OrderCard'
import { Loader2, ClipboardList, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/providers/LanguageProvider'

export default function OrdersPage() {
  const { data: orders, isLoading, refetch } = useMyOrders()
  const { t } = useLanguage()

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">{t('orders.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('orders.subtitle')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl h-10 gap-2 border-secondary/20 hover:bg-secondary/5"
        >
          <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          {t('orders.refresh')}
        </Button>
      </div>

      {isLoading && !orders ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center space-y-6 bg-white rounded-[3rem] shadow-xl shadow-secondary/5 border-none">
          <div className="p-8 rounded-full bg-secondary/5">
            <ClipboardList className="h-16 w-16 text-muted-foreground/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary">{t('orders.empty')}</h3>
            <p className="text-muted-foreground max-w-xs">{t('orders.empty_desc')}</p>
          </div>
          <Button asChild className="rounded-2xl h-12 px-8 font-bold">
            <a href="/vendors">{t('orders.order_now')}</a>
          </Button>
        </div>
      )}
    </div>
  )
}
