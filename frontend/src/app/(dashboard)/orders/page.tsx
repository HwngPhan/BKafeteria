'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderCard } from '@/features/order/components/OrderCard'
import { OrderDto } from '@/features/order/config/order.types'
import { useMyOrders } from '@/features/order/data-access/order.queries'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { useLanguage } from '@/providers/LanguageProvider'
import { ChevronLeft, ChevronRight, ClipboardList, Loader2, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
  const [page, setPage] = useState(0)
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const { data: ordersPage, isLoading, refetch } = useMyOrders(page)
  const { t } = useLanguage()
  const applyUpdates = useRealtimeOrders(state => state.applyUpdates)
  const updates = useRealtimeOrders(state => state.updates)

  // Sync fetched data into local state
  useEffect(() => {
    if (ordersPage) {
      setOrders(ordersPage.content)
      setTotalPages(ordersPage.totalPages)
    }
  }, [ordersPage])

  // Apply WebSocket updates to local state in real-time
  useEffect(() => {
    if (orders.length > 0 && updates.size > 0) {
      setOrders(prev => applyUpdates(prev))
    }
  }, [updates])

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">{t('orders.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('orders.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-40 rounded-xl border-secondary/20 h-10">
              <SelectValue placeholder={t('manager.orders.sort')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-xl">
              <SelectItem value="newest" className="rounded-lg cursor-pointer">{t('manager.orders.newest')}</SelectItem>
              <SelectItem value="oldest" className="rounded-lg cursor-pointer">{t('manager.orders.oldest')}</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      {isLoading && !ordersPage ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!ordersPage?.hasPreviousPage}
              className="rounded-xl h-10 gap-2 border-secondary/20 hover:bg-secondary/5"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!ordersPage?.hasNextPage}
              className="rounded-xl h-10 gap-2 border-secondary/20 hover:bg-secondary/5"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </>
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