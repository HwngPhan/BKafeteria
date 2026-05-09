'use client'

import { OrderDto } from '../config/order.types'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Clock, CreditCard, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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
  PENDING: 'Chờ thanh toán',
  PURCHASED: 'Đã thanh toán',
  PROCESSING: 'Đang chế biến',
  COMPLETED: 'Hoàn thành',
  DELIVERED: 'Đã giao',
  CANCELED: 'Đã hủy',
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card className="rounded-[2rem] border-none bg-white shadow-xl shadow-secondary/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 group">
      <CardHeader className="p-6 bg-secondary/5 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ClipboardList size={20} />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Đơn hàng #{order.orderId.substring(0, 8)}</CardTitle>
            <CardDescription className="text-[10px] flex items-center gap-1">
              <Clock size={10} />
              {new Date(order.createdAt).toLocaleString()}
            </CardDescription>
          </div>
        </div>
        <Badge className={cn('rounded-full px-3 py-0.5 text-[10px] font-bold border', statusColors[order.status])}>
          {statusLabels[order.status] || order.status}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {order.orderItems.map((vendorOrder, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-secondary" />
                {vendorOrder.vendorName}
              </h4>
              <span className="text-xs font-bold text-muted-foreground">{vendorOrder.vendorPrice.toLocaleString()}đ</span>
            </div>
            <div className="space-y-2 pl-3">
              {vendorOrder.menuItems.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.itemName} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
            </div>
            {idx < order.orderItems.length - 1 && <Separator className="bg-secondary/5" />}
          </div>
        ))}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium">Tổng số tiền</span>
          <span className="text-xl font-black text-primary">{order.totalPrice.toLocaleString()}đ</span>
        </div>
        
        <div className="flex gap-2">
          {order.status === 'PENDING' && (
            <Button size="sm" className="rounded-xl h-10 px-4 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
              <CreditCard size={16} className="mr-2" /> Thanh toán
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild className="rounded-xl h-10 px-4 font-bold group-hover:bg-secondary/5">
            <Link href={`/orders/${order.orderId}`}>
              Chi tiết <ChevronRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
