'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ChevronRight, ClipboardList, Clock, CreditCard, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { OrderDto } from '../config/order.types'
import { toast } from 'sonner'
import { usePayOrder } from '../data-access/order.queries'
import { useLanguage } from '@/providers/LanguageProvider'

interface OrderCardProps {
  order: OrderDto
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PURCHASED: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELED: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  PENDING: 'order_status.pending',
  PURCHASED: 'order_status.purchased',
  PROCESSING: 'order_status.processing',
  COMPLETED: 'order_status.completed',
  DELIVERED: 'order_status.delivered',
  CANCELED: 'order_status.canceled',
}

export function OrderCard({ order }: OrderCardProps) {
  const payOrder = usePayOrder()
  const { t } = useLanguage()

  const handlePay = async () => {
    try {
      await payOrder.mutateAsync(order.orderId)
      toast.success(t('order_card.toast_pay_success'))
    } catch (error: any) {
      toast.error(error?.message || t('order_card.toast_pay_error'))
    }
  }

  return (
    <Card className="rounded-[2rem] border-none bg-white shadow-xl shadow-secondary/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 group">
      <CardHeader className="p-6 bg-secondary/5 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ClipboardList size={20} />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">{t('order_card.id')}{order.orderId.substring(0, 8)}</CardTitle>
            <CardDescription className="text-[10px] flex items-center gap-1">
              <Clock size={10} />
              {new Date(order.createdAt).toLocaleString()}
            </CardDescription>
          </div>
        </div>
        <Badge className={cn('rounded-full px-3 py-0.5 text-[10px] font-bold border', statusColors[order.status])}>
          {t(statusLabels[order.status]) || order.status}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {(order.vendorOrders || []).map((vendorOrder, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-secondary" />
                {vendorOrder.vendorName}
              </h4>
              <span className="text-xs font-bold text-muted-foreground">
                {(vendorOrder.vendorPrice || 0).toLocaleString()}đ
              </span>
            </div>
            <div className="space-y-2 pl-3">
              {vendorOrder.orderItems?.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.itemName} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
            </div>
            {idx < (order.vendorOrders?.length || 0) - 1 && <Separator className="bg-secondary/5" />}
          </div>
        ))}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium">{t('order_card.total_amount')}</span>
          <span className="text-xl font-black text-primary">{(order.totalPrice || 0).toLocaleString()}đ</span>
        </div>

        <div className="flex gap-2">
          {order.status === 'PENDING' && (
            <Button
              size="sm"
              onClick={handlePay}
              disabled={payOrder.isPending}
              className="rounded-xl h-10 px-4 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
            >
              {payOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard size={16} className="mr-2" />
              )}
              {t('order_card.pay_btn')}
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild className="rounded-xl h-10 px-4 font-bold group-hover:bg-secondary/5">
            <Link href={`/orders/${order.orderId}`}>
              {t('order_card.detail_btn')} <ChevronRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
